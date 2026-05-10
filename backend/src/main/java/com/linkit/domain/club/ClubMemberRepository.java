package com.linkit.domain.club;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClubMemberRepository extends JpaRepository<ClubMember, ClubMember.ClubMemberId> {

    List<ClubMember> findByClubId(String clubId);
    List<ClubMember> findByUserId(String userId);

    Optional<ClubMember> findByClubIdAndUserId(String clubId, String userId);

    boolean existsByClubIdAndUserId(String clubId, String userId);

    void deleteByClubIdAndUserId(String clubId, String userId);

    long countByClubId(String clubId);
}
