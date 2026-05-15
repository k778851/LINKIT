package com.linkit.domain.club;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ClubRepository extends JpaRepository<Club, String> {

    List<Club> findByCategory(String category);

    List<Club> findByCreatedBy(String userId);

    @Query("SELECT c FROM Club c WHERE c.isPrivate = false ORDER BY c.createdAt DESC")
    List<Club> findAllPublic();

    @Query("SELECT c FROM Club c WHERE (:category = '전체' OR c.category = :category)")
    List<Club> findByOptionalCategory(@Param("category") String category);

    @Modifying
    @Query("UPDATE Club c SET c.memberCount = c.memberCount + 1 WHERE c.id = :id")
    void incrementMemberCount(@Param("id") String id);

    @Modifying
    @Query("UPDATE Club c SET c.memberCount = CASE WHEN c.memberCount > 0 THEN c.memberCount - 1 ELSE 0 END WHERE c.id = :id")
    void decrementMemberCount(@Param("id") String id);
}
