package com.biblioteca.api.service;

import com.biblioteca.api.dto.LivroRequestDTO;
import com.biblioteca.api.dto.LivroResponseDTO;
import com.biblioteca.api.entity.Livro;
import com.biblioteca.api.exception.RegraNegocioException;
import com.biblioteca.api.exception.RecursoNaoEncontradoException;
import com.biblioteca.api.repository.EmprestimoRepository;
import com.biblioteca.api.repository.LivroRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LivroService {

    private final LivroRepository livroRepository;
    private final EmprestimoRepository emprestimoRepository;

    public LivroService(
            LivroRepository livroRepository,
            EmprestimoRepository emprestimoRepository) {
        this.livroRepository = livroRepository;
        this.emprestimoRepository = emprestimoRepository;
    }

    @Transactional
    public LivroResponseDTO cadastrar(LivroRequestDTO dto) {

        if (livroRepository.existsByIsbn(dto.isbn())) {
            throw new RegraNegocioException("Já existe um livro com este ISBN.");
        }

        Livro livro = new Livro();
        livro.setTitulo(dto.titulo());
        livro.setAutor(dto.autor());
        livro.setIsbn(dto.isbn());
        livro.setAnoPublicacao(dto.anoPublicacao());
        livro.setDisponivel(true);

        return converter(livroRepository.save(livro));
    }

    @Transactional(readOnly = true)
    public Page<LivroResponseDTO> listar(
            String titulo,
            String autor,
            Boolean disponivel,
            Pageable pageable) {

        return livroRepository.filtrar(
                titulo, autor, disponivel, pageable
        ).map(this::converter);
    }

    @Transactional(readOnly = true)
    public LivroResponseDTO buscarPorId(Long id) {
        return converter(buscarLivro(id));
    }

    @Transactional
    public LivroResponseDTO atualizar(Long id, LivroRequestDTO dto) {

        Livro livro = buscarLivro(id);

        livroRepository.findByIsbn(dto.isbn())
                .filter(outro -> !outro.getId().equals(id))
                .ifPresent(outro -> {
                    throw new RegraNegocioException(
                            "Este ISBN já está cadastrado em outro livro."
                    );
                });

        livro.setTitulo(dto.titulo());
        livro.setAutor(dto.autor());
        livro.setIsbn(dto.isbn());
        livro.setAnoPublicacao(dto.anoPublicacao());

        return converter(livroRepository.save(livro));
    }

    @Transactional
    public void excluir(Long id) {

        Livro livro = buscarLivro(id);

        if (emprestimoRepository.existsByLivroIdAndDataDevolucaoIsNull(id)) {
            throw new RegraNegocioException(
                    "Não é possível excluir um livro com empréstimo ativo."
            );
        }

        if (!emprestimoRepository.findByLivroId(id).isEmpty()) {
            throw new RegraNegocioException(
                    "Não é possível excluir um livro que possui histórico de empréstimos."
            );
        }

        livroRepository.delete(livro);
    }

    private Livro buscarLivro(Long id) {
        return livroRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Livro não encontrado: " + id
                ));
    }

    private LivroResponseDTO converter(Livro livro) {
        return new LivroResponseDTO(
                livro.getId(),
                livro.getTitulo(),
                livro.getAutor(),
                livro.getIsbn(),
                livro.getAnoPublicacao(),
                livro.getDisponivel()
        );
    }
}
