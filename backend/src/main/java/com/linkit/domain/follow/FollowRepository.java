package com.linkit.domain.follow;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FollowRepository extends JpaRepository<Follow, Long> {

    Optional<Follow> findByFollowerIdAndFollowingId(String followerId, String followingId);

    boolean existsByFollowerIdAndFollowingId(String followerId, String followingId);

    /** 내가 팔로우하는 사람 목록 (팔로잉) */
    List<Follow> findAllByFollowerId(String followerId);

    /** 나를 팔로우하는 사람 목록 (팔로워) */
    List<Follow> findAllByFollowingId(String followingId);

    long countByFollowerId(String followerId);

    long countByFollowingId(String followingId);

    void deleteByFollowerIdAndFollowingId(String followerId, String followingId);

    /** followerId 가 팔로우하는 ID 목록 */
    @Query("SELECT f.followingId FROM Follow f WHERE f.followerId = :followerId")
    List<String> findFollowingIdsByFollowerId(@Param("followerId") String followerId);
}
