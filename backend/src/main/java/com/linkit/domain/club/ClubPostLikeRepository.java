package com.linkit.domain.club;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ClubPostLikeRepository extends JpaRepository<ClubPostLike, ClubPostLike.ClubPostLikeId> {

    boolean existsByClubPostIdAndUserId(String clubPostId, String userId);

    void deleteByClubPostIdAndUserId(String clubPostId, String userId);

    long countByClubPostId(String clubPostId);
}
