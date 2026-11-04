import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BookOpen, Users, ArrowLeftRight, LayoutDashboard, Search, Plus, Pencil,
  Trash2, CheckCircle2, Clock3, LibraryBig, Menu, X, RefreshCw, ChevronLeft,
  ChevronRight, AlertCircle, RotateCcw, LogOut
} from 'lucide-react';
import './styles.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!response.ok) {
    let message = `Erro ${response.status}`;
    try {
      const body = await response.json();
      message = body.message || body.error || body.detail || message;
    } catch { /* resposta sem JSON */ }
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return response.json();
}

const endpoints = {
  livros: '/api/livros', leitores: '/api/leitores', emprestimos: '/api/emprestimos',
};

function App() {
  const [section, setSection] = useState('dashboard');
  const [mobileNav, setMobileNav] = useState(false);
  const [books, setBooks] = useState([]);
  const [readers, setReaders] = useState([]);
  const [loans, setLoans] = useState([]);
  const [stats, setStats] = useState({ books: 0, readers: 0, active: 0, overdue: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [modal, setModal] = useState(null);
  const [bookFilters, setBookFilters] = useState({ titulo: '', autor: '', disponivel: '' });
  const [readerSearch, setReaderSearch] = useState('');
  const [loanFilter, setLoanFilter] = useState('todos');
  const [page, setPage] = useState(0);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);

  const loadAll = async () => {
    setLoading(true); setError('');
    try {
      const [bookData, readerData, loanData, activeData] = await Promise.all([
        api(`${endpoints.livros}?page=${page}&size=${pageSize}&sort=titulo,asc`),
        api(endpoints.leitores),
        api(endpoints.emprestimos),
        api(`${endpoints.emprestimos}/ativos`),
      ]);
      const bookPage = Array.isArray(bookData) ? { content: bookData, totalPages: 1, totalElements: bookData.length } : bookData;
      const readerList = Array.isArray(readerData) ? readerData : (readerData?.content || []);
      const loanList = Array.isArray(loanData) ? loanData : (loanData?.content || []);
      const activeList = Array.isArray(activeData) ? activeData : (activeData?.content || []);
      setBooks(bookPage.content || []); setReaders(readerList); setLoans(loanList);
      setTotalPages(Math.max(1, bookPage.totalPages || 1));
      const now = new Date();
      const overdue = activeList.filter(l => l.dataPrevistaDevolucao && new Date(`${l.dataPrevistaDevolucao}T23:59:59`) < now).length;
      setStats({ books: bookPage.totalElements ?? bookPage.content?.length ?? 0, readers: readerList.length, active: activeList.length, overdue });
    } catch (e) {
      setError(`${e.message}. Verifique se o Spring Boot está rodando em ${API_BASE}.`);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadAll(); }, [page]);
  useEffect(() => { if (notice) { const t = setTimeout(() => setNotice(''), 3500); return () => clearTimeout(t); } }, [notice]);

  const filteredBooks = useMemo(() => books.filter(b =>
    (!bookFilters.titulo || (b.titulo || '').toLowerCase().includes(bookFilters.titulo.toLowerCase())) &&
    (!bookFilters.autor || (b.autor || '').toLowerCase().includes(bookFilters.autor.toLowerCase())) &&
    (bookFilters.disponivel === '' || String(b.disponivel) === bookFilters.disponivel)
  ), [books, bookFilters]);
  const filteredReaders = useMemo(() => readers.filter(r =>
    `${r.nome || ''} ${r.email || ''}`.toLowerCase().includes(readerSearch.toLowerCase())
  ), [readers, readerSearch]);
  const filteredLoans = useMemo(() => loans.filter(l => {
    if (loanFilter === 'ativos') return l.ativo ?? !l.dataDevolucao;
    if (loanFilter === 'devolvidos') return !(l.ativo ?? !l.dataDevolucao);
    return true;
  }), [loans, loanFilter]);

  const saveEntity = async (kind, data, id) => {
    const path = endpoints[kind] + (id ? `/${id}` : '');
    await api(path, { method: id ? 'PUT' : 'POST', body: JSON.stringify(data) });
    setModal(null); setNotice(id ? 'Registro atualizado.' : 'Registro cadastrado.'); await loadAll();
  };
  const deleteEntity = async (kind, id, label) => {
    if (!window.confirm(`Excluir ${label}? Essa ação não pode ser desfeita.`)) return;
    try { await api(`${endpoints[kind]}/${id}`, { method: 'DELETE' }); setNotice('Registro excluído.'); await loadAll(); }
    catch (e) { setError(e.message); }
  };
  const createLoan = async data => {
    await api(endpoints.emprestimos, { method: 'POST', body: JSON.stringify(data) });
    setModal(null); setNotice('Empréstimo registrado.'); await loadAll();
  };
  const returnLoan = async id => {
    try { await api(`${endpoints.emprestimos}/${id}/devolucao`, { method: 'PUT' }); setNotice('Devolução registrada.'); await loadAll(); }
    catch (e) { setError(e.message); }
  };

  const navItems = [
    { id: 'dashboard', label: 'Visão geral', icon: LayoutDashboard },
    { id: 'livros', label: 'Livros', icon: BookOpen },
    { id: 'leitores', label: 'Leitores', icon: Users },
    { id: 'emprestimos', label: 'Empréstimos', icon: ArrowLeftRight },
  ];
  const title = navItems.find(n => n.id === section)?.label || 'Visão geral';
  const navigate = id => { setSection(id); setMobileNav(false); setError(''); };

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'open' : ''}`}>
      <div className="brand"><div className="brand-mark"><LibraryBig size={23}/></div><div><strong>Biblioteca</strong><span>PAINEL DE GESTÃO</span></div><button className="close-nav" onClick={() => setMobileNav(false)}><X/></button></div>
      <div className="nav-caption">MENU PRINCIPAL</div>
      <nav>{navItems.map(item => <button key={item.id} className={`nav-item ${section === item.id ? 'active' : ''}`} onClick={() => navigate(item.id)}><item.icon size={18}/><span>{item.label}</span>{section === item.id && <span className="nav-indicator"/>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="sidebar-note"><BookOpen size={18}/><div><b>Gestão simplificada</b><span>Controle seu acervo e empréstimos.</span></div></div><div className="version">Biblioteca API · v1.0</div></div>
    </aside>
    {mobileNav && <div className="nav-overlay" onClick={() => setMobileNav(false)}/>}
    <main className="main-content">
      <header className="topbar"><div className="topbar-left"><button className="menu-toggle" onClick={() => setMobileNav(true)}><Menu/></button><div><span className="breadcrumb">Biblioteca <span>/</span></span><h1>{title}</h1></div></div><div className="topbar-right"><span className="api-status"><i/> API REST</span><button className="icon-button" title="Atualizar dados" onClick={loadAll}><RefreshCw size={17}/></button><div className="avatar">BG</div></div></header>
      <div className="page-wrap">
        {error && <div className="alert error"><AlertCircle size={18}/><span>{error}</span><button onClick={() => setError('')}><X size={16}/></button></div>}
        {notice && <div className="alert success"><CheckCircle2 size={18}/><span>{notice}</span><button onClick={() => setNotice('')}><X size={16}/></button></div>}
        {loading && <div className="loading-line"><span/> Atualizando dados...</div>}
        {section === 'dashboard' && <Dashboard stats={stats} books={books} loans={loans} onNavigate={navigate} />}
        {section === 'livros' && <BooksPage books={filteredBooks} filters={bookFilters} setFilters={setBookFilters} page={page} setPage={setPage} totalPages={totalPages} onAdd={() => setModal({ type: 'livro' })} onEdit={b => setModal({ type: 'livro', item: b })} onDelete={b => deleteEntity('livros', b.id, `o livro “${b.titulo}”`)} />}
        {section === 'leitores' && <ReadersPage readers={filteredReaders} search={readerSearch} setSearch={setReaderSearch} onAdd={() => setModal({ type: 'leitor' })} onEdit={r => setModal({ type: 'leitor', item: r })} onDelete={r => deleteEntity('leitores', r.id, `o leitor “${r.nome}”`)} />}
        {section === 'emprestimos' && <LoansPage loans={filteredLoans} filter={loanFilter} setFilter={setLoanFilter} readers={readers} books={books} onAdd={() => setModal({ type: 'emprestimo' })} onReturn={returnLoan} />}
      </div>
      <footer className="footer"><span>Biblioteca API</span><span>Frontend React · Spring Boot REST</span></footer>
    </main>
    {modal && <Modal modal={modal} books={books} readers={readers} onClose={() => setModal(null)} onSave={saveEntity} onCreateLoan={createLoan}/>}
  </div>;
}

function Dashboard({ stats, books, loans, onNavigate }) {
  const recent = [...loans].sort((a,b) => (b.dataEmprestimo || '').localeCompare(a.dataEmprestimo || '')).slice(0,5);
  return <>
    <div className="welcome-row"><div><p className="eyebrow">RESUMO DA BIBLIOTECA</p><h2>Bem-vindo ao painel</h2><p className="muted">Acompanhe o acervo, os leitores e os empréstimos em um só lugar.</p></div><button className="primary-button" onClick={() => onNavigate('emprestimos')}><Plus size={17}/> Novo empréstimo</button></div>
    <div className="stats-grid">
      <StatCard title="Livros cadastrados" value={stats.books} icon={BookOpen} tone="blue" foot="Total do acervo" />
      <StatCard title="Leitores" value={stats.readers} icon={Users} tone="violet" foot="Cadastros ativos" />
      <StatCard title="Empréstimos ativos" value={stats.active} icon={ArrowLeftRight} tone="green" foot="Livros emprestados" />
      <StatCard title="Em atraso" value={stats.overdue} icon={Clock3} tone="orange" foot="Precisam de atenção" />
    </div>
    <div className="dashboard-grid"><section className="panel"><div className="panel-header"><div><h3>Empréstimos recentes</h3><p>Movimentações mais recentes da biblioteca</p></div><button className="text-button" onClick={() => onNavigate('emprestimos')}>Ver todos <ChevronRight size={15}/></button></div>
      {recent.length ? <div className="table-wrap"><table><thead><tr><th>Livro</th><th>Leitor</th><th>Data</th><th>Status</th></tr></thead><tbody>{recent.map(l => <tr key={l.id}><td><b>{l.tituloLivro || l.livro?.titulo || `Livro #${l.livroId}`}</b></td><td>{l.nomeLeitor || l.leitor?.nome || `Leitor #${l.leitorId}`}</td><td>{formatDate(l.dataEmprestimo)}</td><td><StatusBadge active={l.ativo ?? !l.dataDevolucao}/></td></tr>)}</tbody></table></div> : <EmptyState text="Nenhum empréstimo registrado até agora."/>}
    </section><section className="panel quick-panel"><div className="panel-header"><div><h3>Ações rápidas</h3><p>Atalhos para operações frequentes</p></div></div><button className="quick-action" onClick={() => onNavigate('livros')}><span className="quick-icon blue"><BookOpen/></span><span><b>Gerenciar livros</b><small>Adicionar ou editar o acervo</small></span><ChevronRight/></button><button className="quick-action" onClick={() => onNavigate('leitores')}><span className="quick-icon violet"><Users/></span><span><b>Cadastrar leitor</b><small>Gerenciar leitores da biblioteca</small></span><ChevronRight/></button><button className="quick-action" onClick={() => onNavigate('emprestimos')}><span className="quick-icon green"><ArrowLeftRight/></span><span><b>Empréstimos</b><small>Registrar retirada ou devolução</small></span><ChevronRight/></button><div className="availability-note"><span className="dot green-dot"/> {books.filter(b => b.disponivel).length} livros disponíveis nesta página</div></section></div>
  </>;
}
function StatCard({ title, value, icon: Icon, tone, foot }) { return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={20}/></div><div className="stat-title">{title}</div><div className="stat-value">{value}</div><div className="stat-foot">{foot}</div></div>; }

function BooksPage({ books, filters, setFilters, page, setPage, totalPages, onAdd, onEdit, onDelete }) {
  return <><PageHeading eyebrow="ACERVO" title="Livros" description="Cadastre, consulte e mantenha o acervo atualizado." action={<button className="primary-button" onClick={onAdd}><Plus size={17}/> Adicionar livro</button>}/>
    <section className="panel"><div className="filter-bar"><div className="search-field"><Search size={17}/><input placeholder="Buscar por título..." value={filters.titulo} onChange={e => setFilters({...filters, titulo: e.target.value})}/></div><div className="search-field author-search"><Search size={17}/><input placeholder="Autor" value={filters.autor} onChange={e => setFilters({...filters, autor: e.target.value})}/></div><select value={filters.disponivel} onChange={e => setFilters({...filters, disponivel: e.target.value})}><option value="">Todas as situações</option><option value="true">Disponíveis</option><option value="false">Emprestados</option></select><span className="result-count">{books.length} resultado(s)</span></div>
    <div className="table-wrap"><table><thead><tr><th>Livro</th><th>ISBN</th><th>Ano</th><th>Disponibilidade</th><th className="actions-col">Ações</th></tr></thead><tbody>{books.map(b => <tr key={b.id}><td><div className="book-cell"><div className="book-cover"><BookOpen size={19}/></div><div><b>{b.titulo}</b><small>{b.autor}</small></div></div></td><td className="mono">{b.isbn}</td><td>{b.anoPublicacao || '—'}</td><td><span className={`availability ${b.disponivel ? 'available' : 'unavailable'}`}><i/>{b.disponivel ? 'Disponível' : 'Emprestado'}</span></td><td><div className="row-actions"><button title="Editar" onClick={() => onEdit(b)}><Pencil size={16}/></button><button title="Excluir" className="danger-action" onClick={() => onDelete(b)}><Trash2 size={16}/></button></div></td></tr>)}</tbody></table>{!books.length && <EmptyState text="Nenhum livro encontrado com esses filtros."/>}</div>
    <Pagination page={page} setPage={setPage} totalPages={totalPages}/></section></>;
}
function ReadersPage({ readers, search, setSearch, onAdd, onEdit, onDelete }) {
  return <><PageHeading eyebrow="CADASTROS" title="Leitores" description="Gerencie as pessoas cadastradas para realizar empréstimos." action={<button className="primary-button" onClick={onAdd}><Plus size={17}/> Adicionar leitor</button>}/><section className="panel"><div className="filter-bar"><div className="search-field wide-search"><Search size={17}/><input placeholder="Buscar por nome ou e-mail..." value={search} onChange={e => setSearch(e.target.value)}/></div><span className="result-count">{readers.length} leitor(es)</span></div><div className="table-wrap"><table><thead><tr><th>Leitor</th><th>E-mail</th><th>ID</th><th className="actions-col">Ações</th></tr></thead><tbody>{readers.map(r => <tr key={r.id}><td><div className="reader-cell"><div className="reader-avatar">{(r.nome || '?').split(' ').slice(0,2).map(x => x[0]).join('').toUpperCase()}</div><b>{r.nome}</b></div></td><td>{r.email}</td><td className="mono">#{r.id}</td><td><div className="row-actions"><button title="Editar" onClick={() => onEdit(r)}><Pencil size={16}/></button><button title="Excluir" className="danger-action" onClick={() => onDelete(r)}><Trash2 size={16}/></button></div></td></tr>)}</tbody></table>{!readers.length && <EmptyState text="Nenhum leitor cadastrado."/>}</div></section></>;
}
function LoansPage({ loans, filter, setFilter, readers, books, onAdd, onReturn }) {
  return <><PageHeading eyebrow="CIRCULAÇÃO" title="Empréstimos" description="Registre retiradas e acompanhe devoluções." action={<button className="primary-button" onClick={onAdd}><Plus size={17}/> Novo empréstimo</button>}/><section className="panel"><div className="filter-bar"><div className="segmented"><button className={filter === 'todos' ? 'selected' : ''} onClick={() => setFilter('todos')}>Todos</button><button className={filter === 'ativos' ? 'selected' : ''} onClick={() => setFilter('ativos')}>Ativos</button><button className={filter === 'devolvidos' ? 'selected' : ''} onClick={() => setFilter('devolvidos')}>Devolvidos</button></div><span className="result-count">{loans.length} registro(s)</span></div><div className="table-wrap"><table><thead><tr><th>Livro</th><th>Leitor</th><th>Empréstimo</th><th>Devolução prevista</th><th>Status</th><th>Ação</th></tr></thead><tbody>{loans.map(l => {const active = l.ativo ?? !l.dataDevolucao; const overdue = active && l.dataPrevistaDevolucao && new Date(`${l.dataPrevistaDevolucao}T23:59:59`) < new Date(); return <tr key={l.id}><td><b>{l.tituloLivro || l.livro?.titulo || books.find(b => b.id === l.livroId)?.titulo || `Livro #${l.livroId}`}</b><small className="subline">Empréstimo #{l.id}</small></td><td>{l.nomeLeitor || l.leitor?.nome || readers.find(r => r.id === l.leitorId)?.nome || `Leitor #${l.leitorId}`}</td><td>{formatDate(l.dataEmprestimo)}</td><td>{formatDate(l.dataPrevistaDevolucao)}</td><td>{overdue ? <span className="status-badge overdue"><Clock3 size={13}/> Em atraso</span> : <StatusBadge active={active}/>}</td><td>{active ? <button className="return-button" onClick={() => onReturn(l.id)}><RotateCcw size={14}/> Devolver</button> : <span className="returned-label"><CheckCircle2 size={14}/> Devolvido</span>}</td></tr>;})}</tbody></table>{!loans.length && <EmptyState text="Nenhum empréstimo encontrado."/>}</div></section></>;
}

function PageHeading({ eyebrow, title, description, action }) { return <div className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p className="muted">{description}</p></div>{action}</div>; }
function StatusBadge({ active }) { return <span className={`status-badge ${active ? 'active-status' : 'returned-status'}`}>{active ? <><Clock3 size={13}/> Ativo</> : <><CheckCircle2 size={13}/> Devolvido</>}</span>; }
function EmptyState({ text }) { return <div className="empty-state"><BookOpen size={25}/><p>{text}</p></div>; }
function Pagination({ page, setPage, totalPages }) { return <div className="pagination"><span>Página {page + 1} de {totalPages}</span><div><button disabled={page <= 0} onClick={() => setPage(p => Math.max(0, p - 1))}><ChevronLeft size={16}/> Anterior</button><button disabled={page + 1 >= totalPages} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}>Próxima <ChevronRight size={16}/></button></div></div>; }
function formatDate(value) { if (!value) return '—'; const date = new Date(`${value}T00:00:00`); return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-BR'); }

function Modal({ modal, books, readers, onClose, onSave, onCreateLoan }) {
  const { type, item } = modal; const edit = Boolean(item);
  const [form, setForm] = useState(type === 'livro' ? { titulo: item?.titulo || '', autor: item?.autor || '', isbn: item?.isbn || '', anoPublicacao: item?.anoPublicacao || '' } : type === 'leitor' ? { nome: item?.nome || '', email: item?.email || '' } : { livroId: '', leitorId: '' });
  const [saving, setSaving] = useState(false); const [error, setError] = useState('');
  const change = e => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async e => { e.preventDefault(); setSaving(true); setError(''); try {
    if (type === 'emprestimo') await onCreateLoan({ livroId: Number(form.livroId), leitorId: Number(form.leitorId) });
    else { const data = type === 'livro' ? { ...form, anoPublicacao: form.anoPublicacao ? Number(form.anoPublicacao) : null } : form; await onSave(type === 'livro' ? 'livros' : 'leitores', data, item?.id); }
  } catch (err) { setError(err.message); } finally { setSaving(false); } };
  const title = type === 'livro' ? (edit ? 'Editar livro' : 'Adicionar livro') : type === 'leitor' ? (edit ? 'Editar leitor' : 'Adicionar leitor') : 'Novo empréstimo';
  return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}><div className="modal"><div className="modal-header"><div><p className="eyebrow">BIBLIOTECA</p><h3>{title}</h3></div><button className="icon-button" onClick={onClose}><X size={19}/></button></div><form onSubmit={submit}><div className="modal-body">
    {type === 'livro' && <><FormField label="Título" required><input name="titulo" value={form.titulo} onChange={change} required maxLength="150" placeholder="Ex.: Dom Casmurro"/></FormField><FormField label="Autor" required><input name="autor" value={form.autor} onChange={change} required maxLength="120" placeholder="Nome do autor"/></FormField><div className="form-row"><FormField label="ISBN" required><input name="isbn" value={form.isbn} onChange={change} required placeholder="ISBN"/></FormField><FormField label="Ano de publicação"><input name="anoPublicacao" type="number" value={form.anoPublicacao} onChange={change} min="0" max="2100" placeholder="2024"/></FormField></div></>}
    {type === 'leitor' && <><FormField label="Nome completo" required><input name="nome" value={form.nome} onChange={change} required maxLength="120" placeholder="Nome do leitor"/></FormField><FormField label="E-mail" required><input name="email" type="email" value={form.email} onChange={change} required placeholder="leitor@email.com"/></FormField></>}
    {type === 'emprestimo' && <><p className="form-hint">Selecione um livro disponível e o leitor que realizará o empréstimo.</p><FormField label="Livro" required><select name="livroId" value={form.livroId} onChange={change} required><option value="">Selecione um livro...</option>{books.filter(b => b.disponivel).map(b => <option key={b.id} value={b.id}>{b.titulo} — {b.autor}</option>)}</select></FormField><FormField label="Leitor" required><select name="leitorId" value={form.leitorId} onChange={change} required><option value="">Selecione um leitor...</option>{readers.map(r => <option key={r.id} value={r.id}>{r.nome} ({r.email})</option>)}</select></FormField><div className="loan-info"><Clock3 size={16}/> Prazo padrão de devolução: 14 dias, calculado pela API.</div></>}
    {error && <div className="form-error"><AlertCircle size={15}/>{error}</div>}
  </div><div className="modal-footer"><button type="button" className="secondary-button" onClick={onClose}>Cancelar</button><button type="submit" className="primary-button" disabled={saving}>{saving ? 'Salvando...' : edit ? 'Salvar alterações' : type === 'emprestimo' ? 'Registrar empréstimo' : 'Cadastrar'}</button></div></form></div></div>;
}
function FormField({ label, required, children }) { return <label className="form-field"><span>{label}{required && <i> *</i>}</span>{children}</label>; }

createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
