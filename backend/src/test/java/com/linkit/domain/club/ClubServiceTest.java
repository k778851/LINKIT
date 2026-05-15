package com.linkit.domain.club;

import com.linkit.domain.notification.NotificationService;
import com.linkit.domain.user.User;
import com.linkit.domain.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ClubServiceTest {

    @Mock private ClubRepository clubRepository;
    @Mock private ClubMemberRepository clubMemberRepository;
    @Mock private ClubBookmarkRepository clubBookmarkRepository;
    @Mock private ClubJoinRequestRepository clubJoinRequestRepository;
    @Mock private NotificationService notificationService;
    @Mock private UserRepository userRepository;

    @InjectMocks private ClubService clubService;

    private Club publicClub() {
        return Club.builder()
                .id("club-1")
                .name("Public Club")
                .isPrivate(false)
                .createdBy("owner-1")
                .memberCount(5)
                .build();
    }

    private Club privateClub() {
        return Club.builder()
                .id("club-2")
                .name("Private Club")
                .isPrivate(true)
                .createdBy("owner-2")
                .memberCount(3)
                .build();
    }

    @Test
    void joinClub_throws_whenAlreadyMember() {
        when(clubRepository.findById("club-1")).thenReturn(Optional.of(publicClub()));
        when(clubMemberRepository.existsByClubIdAndUserId("club-1", "user-x"))
                .thenReturn(true);

        assertThatThrownBy(() -> clubService.joinClub("user-x", "club-1"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("이미 가입");
    }

    @Test
    void joinClub_publicClub_addsMemberAndIncrementsCount() {
        when(clubRepository.findById("club-1")).thenReturn(Optional.of(publicClub()));
        when(clubMemberRepository.existsByClubIdAndUserId("club-1", "user-x"))
                .thenReturn(false);
        when(clubRepository.existsById("club-1")).thenReturn(true);

        JoinRequestDto.JoinResult result = clubService.joinClub("user-x", "club-1");

        assertThat(result.getStatus()).isEqualTo("JOINED");
        ArgumentCaptor<ClubMember> captor = ArgumentCaptor.forClass(ClubMember.class);
        verify(clubMemberRepository).save(captor.capture());
        assertThat(captor.getValue().getClubId()).isEqualTo("club-1");
        assertThat(captor.getValue().getUserId()).isEqualTo("user-x");
        assertThat(captor.getValue().getRole()).isEqualTo(ClubMemberRole.MEMBER);
        verify(clubRepository).incrementMemberCount("club-1");
        verify(clubJoinRequestRepository, never()).save(any());
    }

    @Test
    void joinClub_privateClub_createsJoinRequest_notMembership() {
        when(clubRepository.findById("club-2")).thenReturn(Optional.of(privateClub()));
        when(clubMemberRepository.existsByClubIdAndUserId("club-2", "user-y"))
                .thenReturn(false);
        when(clubJoinRequestRepository.existsByClubIdAndUserIdAndStatus(
                "club-2", "user-y", JoinRequestStatus.PENDING)).thenReturn(false);
        when(clubMemberRepository.findByClubIdAndRole("club-2", ClubMemberRole.OWNER))
                .thenReturn(Optional.empty());
        when(userRepository.findById("user-y"))
                .thenReturn(Optional.of(User.builder().id("user-y").nickname("Yuna").build()));
        when(clubJoinRequestRepository.save(any(ClubJoinRequest.class)))
                .thenAnswer(inv -> {
                    ClubJoinRequest r = inv.getArgument(0);
                    r.setId(42L);
                    return r;
                });

        JoinRequestDto.JoinResult result = clubService.joinClub("user-y", "club-2", "hi");

        assertThat(result.getStatus()).isEqualTo("PENDING");
        assertThat(result.getRequestId()).isEqualTo(42L);

        ArgumentCaptor<ClubJoinRequest> captor = ArgumentCaptor.forClass(ClubJoinRequest.class);
        verify(clubJoinRequestRepository).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(JoinRequestStatus.PENDING);
        assertThat(captor.getValue().getMessage()).isEqualTo("hi");

        verify(clubMemberRepository, never()).save(any(ClubMember.class));
        verify(clubRepository, never()).incrementMemberCount(anyString());
        verify(notificationService).send(
                eq("owner-2"), anyString(), anyString(), anyString(), anyString(), anyString());
    }

    @Test
    void changeMemberRole_throws_whenRequesterNotOwner() {
        when(clubMemberRepository.findByClubIdAndUserId("club-1", "requester"))
                .thenReturn(Optional.of(ClubMember.builder()
                        .clubId("club-1").userId("requester").role(ClubMemberRole.MEMBER).build()));

        assertThatThrownBy(() -> clubService.changeMemberRole(
                "club-1", "requester", "target", ClubMemberRole.ADMIN))
                .isInstanceOf(AccessDeniedException.class);
    }
}
