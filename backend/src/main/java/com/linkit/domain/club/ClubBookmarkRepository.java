package com.linkit.domain.club;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClubBookmarkRepository extends JpaRepository<ClubBookmark, ClubBookmark.ClubBookmarkId> {

    List<ClubBookmark> findByUserId(String userId);

    boolean existsByUserIdAndClubId(String userId, String clubId);

    void deleteByUserIdAndClubId(String userId, String clubId);
}
