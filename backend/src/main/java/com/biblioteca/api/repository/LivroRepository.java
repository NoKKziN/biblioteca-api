package com.biblioteca.api.repository;

import com.biblioteca.api.entity.Livro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface LivroRepository extends JpaRepository<Livro, Long> {

    Optional<Livro> findByIsbn(String isbn);

    boolean existsByIsbn(String isbn);

    @Query("""
        SELECT l FROM Livro l
        WHERE (:titulo IS NULL OR LOWER(l.titulo) LIKE LOWER(CONCAT('%', :titulo, '%')))
        AND (:autor IS NULL OR LOWER(l.autor) LIKE LOWER(CONCAT('%', :autor, '%')))
        AND (:disponivel IS NULL OR l.disponivel = :disponivel)
    """)
    org.springframework.data.domain.Page<Livro> filtrar(
            @Param("titulo") String titulo,
            @Param("autor") String autor,
            @Param("disponivel") Boolean disponivel,
            org.springframework.data.domain.Pageable pageable
    );
}
