package com.srtgroup.todolist.repository;

import com.srtgroup.todolist.entity.Category;
import com.srtgroup.todolist.dto.response.CategoryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    boolean existsByName(String name);
    boolean existsByNameAndIdNot(String name, Long id);

    @Query("SELECT new com.srtgroup.todolist.dto.response.CategoryResponse(c.id, c.name, c.description, c.createdAt, c.updatedAt) " +
           "FROM Category c WHERE :name IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<CategoryResponse> findAllCategories(@Param("name") String name, Pageable pageable);
}
