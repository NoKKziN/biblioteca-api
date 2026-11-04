package com.biblioteca.api.service;

import com.biblioteca.api.dto.EmprestimoRequestDTO;
import com.biblioteca.api.dto.EmprestimoResponseDTO;
import com.biblioteca.api.entity.Emprestimo;
import com.biblioteca.api.entity.Leitor;
import com.biblioteca.api.entity.Livro;
import com.biblioteca.api.exception.RegraNegocioException;
import com.biblioteca.api.exception.RecursoNaoEncontradoException;
import com.biblioteca.api.repository.EmprestimoRepository;
import com.biblioteca.api.repository.LeitorRepository;
import com.biblioteca.api.repository.LivroRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class EmprestimoService {

    private final EmprestimoRepository emprestimoRepository;
    private final LivroRepository livroRepository;
    private final LeitorRepository leitorRepository;

    public EmprestimoService(
            EmprestimoRepository emprestimoRepository,
            LivroRepository livroRepository,
            LeitorRepository leitorRepository) {
        this.emprestimoRepository = emprestimoRepository;
        this.livroRepository = livroRepository;
        this.leitorRepository = leitorRepository;
    }

    @Transactional
    public EmprestimoResponseDTO emprestar(EmprestimoRequestDTO dto) {

        Livro livro = livroRepository.findById(dto.livroId())
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Livro não encontrado."
                ));

        Leitor leitor = leitorRepository.findById(dto.leitorId())
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Leitor não encontrado."
                ));

        if (!livro.getDisponivel()) {
            throw new RegraNegocioException(
                    "Este livro não está disponível para empréstimo."
            );
        }

        if (emprestimoRepository.existsByLivroIdAndDataDevolucaoIsNull(
                livro.getId())) {
            throw new RegraNegocioException(
                    "Este livro já possui um empréstimo ativo."
            );
        }

        long emprestimosAtivos =
                emprestimoRepository.countByLeitorIdAndDataDevolucaoIsNull(
                        leitor.getId()
                );

        if (emprestimosAtivos >= 3) {
            throw new RegraNegocioException(
                    "O leitor atingiu o limite de 3 empréstimos ativos."
            );
        }

        Emprestimo emprestimo = new Emprestimo();

        emprestimo.setLivro(livro);
        emprestimo.setLeitor(leitor);
        emprestimo.setDataEmprestimo(LocalDate.now());
        emprestimo.setDataPrevistaDevolucao(LocalDate.now().plusDays(14));

        livro.setDisponivel(false);

        livroRepository.save(livro);

        return converter(emprestimoRepository.save(emprestimo));
    }

    @Transactional(readOnly = true)
    public List<EmprestimoResponseDTO> listar() {
        return emprestimoRepository.findAll()
                .stream()
                .map(this::converter)
                .toList();
    }

    @Transactional(readOnly = true)
    public EmprestimoResponseDTO buscarPorId(Long id) {
        return converter(buscarEmprestimo(id));
    }

    @Transactional(readOnly = true)
    public List<EmprestimoResponseDTO> listarAtivos() {
        return emprestimoRepository.findByDataDevolucaoIsNull()
                .stream()
                .map(this::converter)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EmprestimoResponseDTO> listarPorLeitor(Long leitorId) {

        if (!leitorRepository.existsById(leitorId)) {
            throw new RecursoNaoEncontradoException(
                    "Leitor não encontrado."
            );
        }

        return emprestimoRepository.findByLeitorId(leitorId)
                .stream()
                .map(this::converter)
                .toList();
    }

    @Transactional
    public EmprestimoResponseDTO devolver(Long id) {

        Emprestimo emprestimo = buscarEmprestimo(id);

        if (emprestimo.getDataDevolucao() != null) {
            throw new RegraNegocioException(
                    "Este empréstimo já foi devolvido."
            );
        }

        emprestimo.setDataDevolucao(LocalDate.now());
        emprestimo.getLivro().setDisponivel(true);

        livroRepository.save(emprestimo.getLivro());

        return converter(emprestimoRepository.save(emprestimo));
    }

    private Emprestimo buscarEmprestimo(Long id) {
        return emprestimoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Empréstimo não encontrado: " + id
                ));
    }

    private EmprestimoResponseDTO converter(Emprestimo emprestimo) {

        return new EmprestimoResponseDTO(
                emprestimo.getId(),
                emprestimo.getLivro().getId(),
                emprestimo.getLivro().getTitulo(),
                emprestimo.getLeitor().getId(),
                emprestimo.getLeitor().getNome(),
                emprestimo.getDataEmprestimo(),
                emprestimo.getDataPrevistaDevolucao(),
                emprestimo.getDataDevolucao(),
                emprestimo.getDataDevolucao() == null
        );
    }
}
