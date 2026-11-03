package com.biblioteca.api.dto;

import java.time.LocalDate;

public record EmprestimoResponseDTO(
        Long id,
        Long livroId,
        String tituloLivro,
        Long leitorId,
        String nomeLeitor,
        LocalDate dataEmprestimo,
        LocalDate dataPrevistaDevolucao,
        LocalDate dataDevolucao,
        boolean ativo
) {}
