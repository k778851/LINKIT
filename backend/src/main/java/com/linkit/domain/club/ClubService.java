package com.linkit.domain.club;

import com.linkit.domain.notification.NotificationService;
import com.linkit.domain.user.User;
import com.linkit.domain.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ClubService {

    private final ClubRepository             clubRepository;
    private final ClubMemberRepository       clubMemberRepository;
    private final ClubBookmarkRepository     clubBookmarkRepository;
    private final ClubJoinRequestRepository  clubJoinRequestRepository;
    private final NotificationService        notificationService;
    private final UserRepository             userRepository;

    public List<ClubDto.Response> getClubs(String category, String sort) {
        List<Club> clubs = "전체".equals(category)
                ? clubRepository.findAll()
                : clubRepository.findByCategory(category);

        Comparator<Club> comparator = switch (sort != null ? sort : "최신순") {
            case "인기순" -> Comparator.comparingInt(Club::getMemberCount).reversed();
            default      -> Comparator.comparing(Club::getCreatedAt).reversed();
        };

        return clubs.stream()
                .sorted(comparator)
                .map(ClubDto.Response::from)
                .toList();
    }

    public ClubDto.Response getClub(String clubId) {
        return ClubDto.Response.from(findById(clubId));
    }

    @Transactional
    public ClubDto.Response createClub(ClubDto.CreateRequest req, String userId) {
        Club club = Club.builder()
                .id("club-" + UUID.randomUUID().toString().substring(0, 8))
                .name(req.getName())
                .emoji(req.getEmoji() != null ? req.getEmoji() : "📌")
                .coverImage(req.getCoverImage())
                .category(req.getCategory())
                .description(req.getDescription())
                .schedule(req.getSchedule())
                .location(req.getLocation())
                .isPrivate(req.isPrivate())
                .tags(req.getTags() != null ? req.getTags() : List.of())
                .memberCount(1)
                .createdBy(userId)
                .build();
        return ClubDto.Response.from(clubRepository.save(club));
    }

    @Transactional
    public ClubDto.Response updateClub(String clubId, ClubDto.UpdateRequest req, String userId) {
        Club club = findById(clubId);
        if (!club.getCreatedBy().equals(userId)) throw new AccessDeniedException("클럽 수정 권한이 없습니다.");

        if (req.getName()        != null) club.setName(req.getName());
        if (req.getEmoji()       != null) club.setEmoji(req.getEmoji());
        if (req.getCoverImage()  != null) club.setCoverImage(req.getCoverImage());
        if (req.getCategory()    != null) club.setCategory(req.getCategory());
        if (req.getDescription() != null) club.setDescription(req.getDescription());
        if (req.getSchedule()    != null) club.setSchedule(req.getSchedule());
        if (req.getLocation()    != null) club.setLocation(req.getLocation());
        if (req.getIsPrivate()   != null) club.setPrivate(req.getIsPrivate());
        if (req.getTags()        != null) { club.getTags().clear(); club.getTags().addAll(req.getTags()); }

        return ClubDto.Response.from(club);
    }

    @Transactional
    public void deleteClub(String clubId, String userId) {
        Club club = findById(clubId);
        if (!club.getCreatedBy().equals(userId)) throw new AccessDeniedException("클럽 삭제 권한이 없습니다.");
        clubRepository.delete(club);
    }

    /* ── 멤버십 ──────────────────────────────────────────── */

    /**
     * 클럽 가입.
     * - 공개 클럽: 즉시 가입 (JOINED)
     * - 비공개 클럽: 가입 신청 생성 (PENDING). 단, 클럽 개설자는 즉시 가입.
     */
    @Transactional
    public JoinRequestDto.JoinResult joinClub(String userId, String clubId) {
        return joinClub(userId, clubId, null);
    }

    @Transactional
    public JoinRequestDto.JoinResult joinClub(String userId, String clubId, String message) {
        Club club = findById(clubId);

        if (clubMemberRepository.existsByClubIdAndUserId(clubId, userId)) {
            throw new IllegalStateException("이미 가입된 클럽입니다.");
        }

        // 비공개 클럽이며 본인이 개설자가 아닌 경우 → 가입 신청 플로우
        if (club.isPrivate() && !userId.equals(club.getCreatedBy())) {
            if (clubJoinRequestRepository.existsByClubIdAndUserIdAndStatus(
                    clubId, userId, JoinRequestStatus.PENDING)) {
                throw new IllegalStateException("이미 가입 신청 중입니다.");
            }

            ClubJoinRequest saved = clubJoinRequestRepository.save(ClubJoinRequest.builder()
                    .clubId(clubId)
                    .userId(userId)
                    .message(message)
                    .status(JoinRequestStatus.PENDING)
                    .build());

            // 클럽 OWNER 알림 (없으면 createdBy 로 폴백)
            String ownerId = clubMemberRepository
                    .findByClubIdAndRole(clubId, ClubMemberRole.OWNER)
                    .map(ClubMember::getUserId)
                    .orElse(club.getCreatedBy());

            String requesterNickname = userRepository.findById(userId)
                    .map(User::getNickname)
                    .orElse(userId);

            notificationService.send(
                    ownerId,
                    "club",
                    "📩",
                    "새 가입 신청이 도착했습니다",
                    requesterNickname + "님이 " + club.getName() + " 에 가입을 신청했어요",
                    "/clubs/" + clubId + "/admin/join-requests"
            );

            return JoinRequestDto.JoinResult.builder()
                    .status("PENDING")
                    .requestId(saved.getId())
                    .build();
        }

        // 즉시 가입 — 개설자는 OWNER, 그 외는 MEMBER
        ClubMemberRole role = userId.equals(club.getCreatedBy())
                ? ClubMemberRole.OWNER
                : ClubMemberRole.MEMBER;
        clubMemberRepository.save(ClubMember.builder()
                .clubId(clubId)
                .userId(userId)
                .role(role)
                .build());
        incrementMember(clubId);

        return JoinRequestDto.JoinResult.builder().status("JOINED").build();
    }

    @Transactional
    public void leaveClub(String userId, String clubId) {
        clubMemberRepository.deleteByClubIdAndUserId(clubId, userId);
        decrementMember(clubId);
    }

    /* ── 가입 신청 관리 ──────────────────────────────────── */

    /** 클럽의 PENDING 가입 신청 목록 — OWNER/ADMIN 만 조회 가능 */
    public List<JoinRequestDto.Response> listPendingJoinRequests(String clubId, String requesterId) {
        requireOwnerOrAdmin(clubId, requesterId);
        return clubJoinRequestRepository
                .findByClubIdAndStatus(clubId, JoinRequestStatus.PENDING)
                .stream()
                .map(r -> JoinRequestDto.Response.from(
                        r,
                        userRepository.findById(r.getUserId())
                                .map(User::getNickname)
                                .orElse(r.getUserId())))
                .toList();
    }

    /** 가입 신청 승인 */
    @Transactional
    public JoinRequestDto.Response approveJoinRequest(String clubId, Long requestId, String approverId) {
        requireOwnerOrAdmin(clubId, approverId);
        Club club = findById(clubId);

        ClubJoinRequest request = clubJoinRequestRepository.findByIdAndClubId(requestId, clubId)
                .orElseThrow(() -> new EntityNotFoundException("가입 신청을 찾을 수 없습니다."));

        if (request.getStatus() != JoinRequestStatus.PENDING) {
            throw new IllegalStateException("이미 처리된 신청입니다.");
        }

        // 이미 멤버라면 신청만 닫음
        if (!clubMemberRepository.existsByClubIdAndUserId(clubId, request.getUserId())) {
            clubMemberRepository.save(ClubMember.builder()
                    .clubId(clubId)
                    .userId(request.getUserId())
                    .role(ClubMemberRole.MEMBER)
                    .build());
            incrementMember(clubId);
        }

        request.setStatus(JoinRequestStatus.APPROVED);
        request.setProcessedAt(LocalDateTime.now());

        notificationService.send(
                request.getUserId(),
                "club",
                "🎉",
                "가입이 승인되었습니다",
                club.getName() + " 모임에 합류했어요!",
                "/clubs/" + clubId
        );

        String nickname = userRepository.findById(request.getUserId())
                .map(User::getNickname).orElse(request.getUserId());
        return JoinRequestDto.Response.from(request, nickname);
    }

    /** 가입 신청 거절 */
    @Transactional
    public JoinRequestDto.Response rejectJoinRequest(String clubId, Long requestId, String approverId) {
        requireOwnerOrAdmin(clubId, approverId);
        Club club = findById(clubId);

        ClubJoinRequest request = clubJoinRequestRepository.findByIdAndClubId(requestId, clubId)
                .orElseThrow(() -> new EntityNotFoundException("가입 신청을 찾을 수 없습니다."));

        if (request.getStatus() != JoinRequestStatus.PENDING) {
            throw new IllegalStateException("이미 처리된 신청입니다.");
        }

        request.setStatus(JoinRequestStatus.REJECTED);
        request.setProcessedAt(LocalDateTime.now());

        notificationService.send(
                request.getUserId(),
                "club",
                "🙏",
                "가입 신청이 거절되었습니다",
                club.getName() + " 모임 신청이 거절되었어요.",
                "/clubs/" + clubId
        );

        String nickname = userRepository.findById(request.getUserId())
                .map(User::getNickname).orElse(request.getUserId());
        return JoinRequestDto.Response.from(request, nickname);
    }

    /* ── 멤버 역할 변경 ────────────────────────────────── */

    /**
     * 클럽 멤버 역할 변경.
     * - OWNER 만 변경 가능 (ADMIN 도 권한 없음)
     * - 본인 역할은 변경 불가 (자기강등 방지)
     * - newRole 은 MEMBER 또는 ADMIN 만 허용 (OWNER 양도는 별도 기능)
     */
    @Transactional
    public void changeMemberRole(String clubId, String requesterId, String targetUserId, ClubMemberRole newRole) {
        if (newRole == null || (newRole != ClubMemberRole.MEMBER && newRole != ClubMemberRole.ADMIN)) {
            throw new IllegalArgumentException("역할은 MEMBER 또는 ADMIN 만 지정할 수 있습니다.");
        }
        if (requesterId.equals(targetUserId)) {
            throw new IllegalArgumentException("자신의 역할은 변경할 수 없습니다.");
        }

        ClubMemberRole requesterRole = clubMemberRepository.findByClubIdAndUserId(clubId, requesterId)
                .map(ClubMember::getRole)
                .orElseThrow(() -> new AccessDeniedException("클럽 관리 권한이 없습니다."));
        if (requesterRole != ClubMemberRole.OWNER) {
            throw new AccessDeniedException("클럽장만 멤버 역할을 변경할 수 있습니다.");
        }

        ClubMember target = clubMemberRepository.findByClubIdAndUserId(clubId, targetUserId)
                .orElseThrow(() -> new EntityNotFoundException("멤버를 찾을 수 없습니다."));

        if (target.getRole() == ClubMemberRole.OWNER) {
            throw new IllegalArgumentException("클럽장의 역할은 변경할 수 없습니다.");
        }

        target.setRole(newRole);
        clubMemberRepository.save(target);
    }

    /** 클럽 OWNER 또는 ADMIN 권한 검사 */
    public void requireOwnerOrAdmin(String clubId, String userId) {
        ClubMemberRole role = clubMemberRepository.findByClubIdAndUserId(clubId, userId)
                .map(ClubMember::getRole)
                .orElseThrow(() -> new AccessDeniedException("클럽 관리 권한이 없습니다."));
        if (role != ClubMemberRole.OWNER && role != ClubMemberRole.ADMIN) {
            throw new AccessDeniedException("클럽 관리 권한이 없습니다.");
        }
    }

    /* ── 북마크 ──────────────────────────────────────────── */

    /** 북마크 토글. 추가 시 true, 제거 시 false 반환 */
    @Transactional
    public boolean toggleBookmark(String userId, String clubId) {
        if (clubBookmarkRepository.existsByUserIdAndClubId(userId, clubId)) {
            clubBookmarkRepository.deleteByUserIdAndClubId(userId, clubId);
            return false;
        }
        clubBookmarkRepository.save(ClubBookmark.builder()
                .userId(userId)
                .clubId(clubId)
                .build());
        return true;
    }

    @Transactional
    public void incrementMember(String clubId) {
        if (!clubRepository.existsById(clubId)) {
            throw new EntityNotFoundException("클럽을 찾을 수 없습니다.");
        }
        clubRepository.incrementMemberCount(clubId);
    }

    @Transactional
    public void decrementMember(String clubId) {
        if (!clubRepository.existsById(clubId)) {
            throw new EntityNotFoundException("클럽을 찾을 수 없습니다.");
        }
        clubRepository.decrementMemberCount(clubId);
    }

    private Club findById(String id) {
        return clubRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("클럽을 찾을 수 없습니다."));
    }
}
