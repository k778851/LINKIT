package com.linkit.domain.club;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ClubService {

    private final ClubRepository       clubRepository;
    private final ClubMemberRepository clubMemberRepository;
    private final ClubBookmarkRepository clubBookmarkRepository;

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

    @Transactional
    public void joinClub(String userId, String clubId) {
        if (clubMemberRepository.existsByClubIdAndUserId(clubId, userId)) {
            throw new IllegalStateException("이미 가입된 클럽입니다.");
        }
        clubMemberRepository.save(ClubMember.builder()
                .clubId(clubId)
                .userId(userId)
                .role(ClubMemberRole.MEMBER)
                .build());
        incrementMember(clubId);
    }

    @Transactional
    public void leaveClub(String userId, String clubId) {
        clubMemberRepository.deleteByClubIdAndUserId(clubId, userId);
        decrementMember(clubId);
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
        Club club = findById(clubId);
        club.setMemberCount(club.getMemberCount() + 1);
    }

    @Transactional
    public void decrementMember(String clubId) {
        Club club = findById(clubId);
        club.setMemberCount(Math.max(0, club.getMemberCount() - 1));
    }

    private Club findById(String id) {
        return clubRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("클럽을 찾을 수 없습니다."));
    }
}
