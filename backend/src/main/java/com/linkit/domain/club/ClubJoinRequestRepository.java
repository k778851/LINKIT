package com.linkit.domain.club;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClubJoinRequestRepository extends JpaRepository<ClubJoinRequest, Long> {

    List<ClubJoinRequest> findByClubIdAndStatus(String clubId, JoinRequestStatus status);

    Optional<ClubJoinRequest> findByClubIdAndUserId(String clubId, String userId);

    boolean existsByClubIdAndUserIdAndStatus(String clubId, String userId, JoinRequestStatus status);

    Optional<ClubJoinRequest> findByIdAndClubId(Long id, String clubId);
}
