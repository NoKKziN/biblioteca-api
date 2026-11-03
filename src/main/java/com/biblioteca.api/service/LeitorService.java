package com.biblioteca.api.service;

import com.biblioteca.api.dto.LeitorRequestDTO;
import com.biblioteca.api.dto.LeitorResponseDTO;
import com.biblioteca.api.entity.Leitor;
import com.biblioteca.api.exception.RegraNegocioException;
import com.biblioteca.api.exception.RecursoNaoEncontradoException;
import com.biblioteca.api.repository.EmprestimoRepository;
import com.biblioteca.api.repository.LeitorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LeitorService {

    private final LeitorRepository leitorRepository;
    private final EmprestimoRepository emprestimoRepository;

    public LeitorService(
            LeitorRepository leitorRepository,
            EmprestimoRepository emprestimoRepository) {
        this.leitorRepository = leitorRepository;
        this.emprestimoRepository = emprestimoRepository;
    }

    @Transactional
    public LeitorResponseDTO cadastrar(LeitorRequestDTO dto) {

        if (leitorRepository.existsByEmail(dto.email())) {
            throw new RegraNegocioException(
                    "Já existe um leitor cadastrado com este email."
            );
        }

        Leitor leitor = new Leitor();
        leitor.setNome(dto.nome());
        leitor.setEmail(dto.email());

        return converter(leitorRepository.save(leitor));
    }

    @Transactional(readOnly = true)
    public List<LeitorResponseDTO> listar() {
        return leitorRepository.findAll()
                .stream()
                .map(this::converter)
                .toList();
    }

    @Transactional(readOnly = true)
    public LeitorResponseDTO buscarPorId(Long id) {
        return converter(buscarLeitor(id));
    }

    @Transactional
    public LeitorResponseDTO atualizar(Long id, LeitorRequestDTO dto) {

        Leitor leitor = buscarLeitor(id);

        leitorRepository.findByEmail(dto.email())
                .filter(outro -> !outro.getId().equals(id))
                .ifPresent(outro -> {
                    throw new RegraNegocioException(
                            "Este email já está cadastrado."
                    );
                });

        leitor.setNome(dto.nome());
        leitor.setEmail(dto.email());

        return converter(leitorRepository.save(leitor));
    }

    @Transactional
    public void excluir(Long id) {

        Leitor leitor = buscarLeitor(id);

        if (emprestimoRepository.existsByLeitorIdAndDataDevolucaoIsNull(id)) {
            throw new RegraNegocioException(
                    "Não é possível excluir um leitor com empréstimos ativos."
            );
        }

        if (!emprestimoRepository.findByLeitorId(id).isEmpty()) {
            throw new RegraNegocioException(
                    "Não é possível excluir um leitor que possui histórico de empréstimos."
            );
        }

        leitorRepository.delete(leitor);
    }

    private Leitor buscarLeitor(Long id) {
        return leitorRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Leitor não encontrado: " + id
                ));
    }

    private LeitorResponseDTO converter(Leitor leitor) {
        return new LeitorResponseDTO(
                leitor.getId(),
                leitor.getNome(),
                leitor.getEmail()
        );
    }
}
