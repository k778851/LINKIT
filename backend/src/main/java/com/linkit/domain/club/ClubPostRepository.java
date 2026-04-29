package com.linkit.domain.club;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClubPostRepository extends JpaRepository<ClubPost, String> {
    List<ClubPost> findByClubIdOrderByCreatedAtDesc(String clubId);
}
