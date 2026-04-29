package com.linkit.domain.club;

import org.springframework.data.jpa.repository.JpaRepository;
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
}
