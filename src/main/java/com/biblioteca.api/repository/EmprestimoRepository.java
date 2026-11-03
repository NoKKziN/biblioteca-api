package com.biblioteca.api.repository;

import com.biblioteca.api.entity.Emprestimo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmprestimoRepository extends JpaRepository<Emprestimo, Long> {

    boolean existsByLivroIdAndDataDevolucaoIsNull(Long livroId);

    long countByLeitorIdAndDataDevolucaoIsNull(Long leitorId);

    boolean existsByLeitorIdAndDataDevolucaoIsNull(Long leitorId);

    List<Emprestimo> findByDataDevolucaoIsNull();

    List<Emprestimo> findByLeitorId(Long leitorId);

    List<Emprestimo> findByDataDevolucaoIsNotNull();

    List<Emprestimo> findByLivroId(Long livroId);
}