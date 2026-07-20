package usecase

import (
	"context"
	"encoding/json"
	"errors"
	"sort"
	"strings"

	"github.com/google/uuid"
	"saude-financeira-api/internal/domain/entity"
	domainErr "saude-financeira-api/internal/domain/errors"
	"saude-financeira-api/internal/domain/repository"
)

// MockPerfilRepository in-memory mock
type MockPerfilRepository struct {
	perfis map[uuid.UUID]*entity.Perfil
}

func NewMockPerfilRepository() *MockPerfilRepository {
	return &MockPerfilRepository{perfis: make(map[uuid.UUID]*entity.Perfil)}
}

func (m *MockPerfilRepository) Create(ctx context.Context, p *entity.Perfil) error {
	m.perfis[p.ID] = p
	return nil
}

func (m *MockPerfilRepository) GetByID(ctx context.Context, id uuid.UUID) (*entity.Perfil, error) {
	p, ok := m.perfis[id]
	if !ok {
		return nil, domainErr.ErrNotFound
	}
	return p, nil
}

func (m *MockPerfilRepository) GetByNome(ctx context.Context, nome string) (*entity.Perfil, error) {
	for _, p := range m.perfis {
		if strings.ToLower(p.Nome) == strings.ToLower(nome) {
			return p, nil
		}
	}
	return nil, domainErr.ErrNotFound
}

func (m *MockPerfilRepository) GetAll(ctx context.Context) ([]*entity.Perfil, error) {
	var list []*entity.Perfil
	for _, p := range m.perfis {
		list = append(list, p)
	}
	return list, nil
}

func (m *MockPerfilRepository) Update(ctx context.Context, p *entity.Perfil) error {
	if _, ok := m.perfis[p.ID]; !ok {
		return domainErr.ErrNotFound
	}
	m.perfis[p.ID] = p
	return nil
}

func (m *MockPerfilRepository) Delete(ctx context.Context, id uuid.UUID) error {
	if _, ok := m.perfis[id]; !ok {
		return domainErr.ErrNotFound
	}
	delete(m.perfis, id)
	return nil
}

// MockCategoriaRepository in-memory mock
type MockCategoriaRepository struct {
	cats map[uuid.UUID]*entity.Categoria
	invs map[uuid.UUID]*entity.CategoriaInvestimento
}

func NewMockCategoriaRepository() *MockCategoriaRepository {
	return &MockCategoriaRepository{
		cats: make(map[uuid.UUID]*entity.Categoria),
		invs: make(map[uuid.UUID]*entity.CategoriaInvestimento),
	}
}

func (m *MockCategoriaRepository) Create(ctx context.Context, c *entity.Categoria) error {
	m.cats[c.ID] = c
	return nil
}

func (m *MockCategoriaRepository) GetAll(ctx context.Context) ([]*entity.Categoria, error) {
	var list []*entity.Categoria
	for _, c := range m.cats {
		list = append(list, c)
	}
	return list, nil
}

func (m *MockCategoriaRepository) GetByNome(ctx context.Context, nome string) (*entity.Categoria, error) {
	for _, c := range m.cats {
		if strings.ToLower(c.Nome) == strings.ToLower(nome) {
			return c, nil
		}
	}
	return nil, domainErr.ErrNotFound
}

func (m *MockCategoriaRepository) UpdateCor(ctx context.Context, id uuid.UUID, cor string) error {
	c, ok := m.cats[id]
	if !ok {
		return domainErr.ErrNotFound
	}
	c.Cor = cor
	return nil
}

func (m *MockCategoriaRepository) CreateInvestimento(ctx context.Context, ci *entity.CategoriaInvestimento) error {
	m.invs[ci.ID] = ci
	return nil
}

func (m *MockCategoriaRepository) GetAllInvestimento(ctx context.Context) ([]*entity.CategoriaInvestimento, error) {
	var list []*entity.CategoriaInvestimento
	for _, c := range m.invs {
		list = append(list, c)
	}
	return list, nil
}

func (m *MockCategoriaRepository) GetInvestimentoByNome(ctx context.Context, nome string) (*entity.CategoriaInvestimento, error) {
	for _, c := range m.invs {
		if strings.ToLower(c.Nome) == strings.ToLower(nome) {
			return c, nil
		}
	}
	return nil, domainErr.ErrNotFound
}

// MockDespesaRepository in-memory mock
type MockDespesaRepository struct {
	despesas map[uuid.UUID]*entity.Despesa
}

func NewMockDespesaRepository() *MockDespesaRepository {
	return &MockDespesaRepository{despesas: make(map[uuid.UUID]*entity.Despesa)}
}

func (m *MockDespesaRepository) Create(ctx context.Context, d *entity.Despesa) error {
	m.despesas[d.ID] = d
	return nil
}

func (m *MockDespesaRepository) GetByID(ctx context.Context, id uuid.UUID) (*entity.Despesa, error) {
	d, ok := m.despesas[id]
	if !ok {
		return nil, domainErr.ErrNotFound
	}
	return d, nil
}

func (m *MockDespesaRepository) GetByPerfil(ctx context.Context, perfilID uuid.UUID) ([]*entity.Despesa, error) {
	var list []*entity.Despesa
	for _, d := range m.despesas {
		if d.PerfilID == perfilID {
			list = append(list, d)
		}
	}
	return list, nil
}

func (m *MockDespesaRepository) Update(ctx context.Context, d *entity.Despesa) error {
	if _, ok := m.despesas[d.ID]; !ok {
		return domainErr.ErrNotFound
	}
	m.despesas[d.ID] = d
	return nil
}

func (m *MockDespesaRepository) Delete(ctx context.Context, id uuid.UUID) error {
	if _, ok := m.despesas[id]; !ok {
		return domainErr.ErrNotFound
	}
	delete(m.despesas, id)
	return nil
}

func (m *MockDespesaRepository) DeleteByPerfil(ctx context.Context, perfilID uuid.UUID) error {
	for id, d := range m.despesas {
		if d.PerfilID == perfilID {
			delete(m.despesas, id)
		}
	}
	return nil
}

func (m *MockDespesaRepository) BulkCreate(ctx context.Context, despesas []*entity.Despesa) error {
	for _, d := range despesas {
		m.despesas[d.ID] = d
	}
	return nil
}

// MockFinanciamentoRepository
type MockFinanciamentoRepository struct {
	fins map[uuid.UUID]*entity.Financiamento
}

func NewMockFinanciamentoRepository() *MockFinanciamentoRepository {
	return &MockFinanciamentoRepository{fins: make(map[uuid.UUID]*entity.Financiamento)}
}

func (m *MockFinanciamentoRepository) Create(ctx context.Context, f *entity.Financiamento) error {
	m.fins[f.ID] = f
	return nil
}

func (m *MockFinanciamentoRepository) GetByID(ctx context.Context, id uuid.UUID) (*entity.Financiamento, error) {
	f, ok := m.fins[id]
	if !ok {
		return nil, domainErr.ErrNotFound
	}
	return f, nil
}

func (m *MockFinanciamentoRepository) GetByPerfil(ctx context.Context, perfilID uuid.UUID) ([]*entity.Financiamento, error) {
	var list []*entity.Financiamento
	for _, f := range m.fins {
		if f.PerfilID == perfilID {
			list = append(list, f)
		}
	}
	return list, nil
}

func (m *MockFinanciamentoRepository) Update(ctx context.Context, f *entity.Financiamento) error {
	if _, ok := m.fins[f.ID]; !ok {
		return domainErr.ErrNotFound
	}
	m.fins[f.ID] = f
	return nil
}

func (m *MockFinanciamentoRepository) Delete(ctx context.Context, id uuid.UUID) error {
	if _, ok := m.fins[id]; !ok {
		return domainErr.ErrNotFound
	}
	delete(m.fins, id)
	return nil
}

func (m *MockFinanciamentoRepository) DeleteByPerfil(ctx context.Context, perfilID uuid.UUID) error {
	for id, f := range m.fins {
		if f.PerfilID == perfilID {
			delete(m.fins, id)
		}
	}
	return nil
}

// MockMetaRepository
type MockMetaRepository struct {
	metas map[uuid.UUID]*entity.Meta
}

func NewMockMetaRepository() *MockMetaRepository {
	return &MockMetaRepository{metas: make(map[uuid.UUID]*entity.Meta)}
}

func (m *MockMetaRepository) Create(ctx context.Context, meta *entity.Meta) error {
	m.metas[meta.ID] = meta
	return nil
}

func (m *MockMetaRepository) GetByID(ctx context.Context, id uuid.UUID) (*entity.Meta, error) {
	meta, ok := m.metas[id]
	if !ok {
		return nil, domainErr.ErrNotFound
	}
	return meta, nil
}

func (m *MockMetaRepository) GetByPerfil(ctx context.Context, perfilID uuid.UUID) ([]*entity.Meta, error) {
	var list []*entity.Meta
	for _, meta := range m.metas {
		if meta.PerfilID == perfilID {
			list = append(list, meta)
		}
	}
	sort.Slice(list, func(i, j int) bool {
		if list[i].Prioridade == list[j].Prioridade {
			return list[i].ID.String() < list[j].ID.String()
		}
		return list[i].Prioridade < list[j].Prioridade
	})
	return list, nil
}

func (m *MockMetaRepository) Update(ctx context.Context, meta *entity.Meta) error {
	if _, ok := m.metas[meta.ID]; !ok {
		return domainErr.ErrNotFound
	}
	m.metas[meta.ID] = meta
	return nil
}

func (m *MockMetaRepository) Delete(ctx context.Context, id uuid.UUID) error {
	if _, ok := m.metas[id]; !ok {
		return domainErr.ErrNotFound
	}
	delete(m.metas, id)
	return nil
}

func (m *MockMetaRepository) BulkUpdatePrioridades(ctx context.Context, updates []repository.MetaPrioridadeUpdate) error {
	for _, u := range updates {
		if meta, ok := m.metas[u.ID]; ok {
			meta.Prioridade = u.Prioridade
		}
	}
	return nil
}

func (m *MockMetaRepository) BulkUpdateTargets(ctx context.Context, updates []repository.MetaTargetUpdate) error {
	for _, u := range updates {
		if meta, ok := m.metas[u.ID]; ok {
			meta.ValorTarget = u.ValorTarget
		}
	}
	return nil
}

// MockPlanejamentoRepository
type MockPlanejamentoRepository struct {
	limits map[string]*entity.Planejamento
}

func NewMockPlanejamentoRepository() *MockPlanejamentoRepository {
	return &MockPlanejamentoRepository{limits: make(map[string]*entity.Planejamento)}
}

func (m *MockPlanejamentoRepository) Create(ctx context.Context, pl *entity.Planejamento) error {
	key := pl.Metodo + "-" + pl.CategoriaID.String()
	m.limits[key] = pl
	return nil
}

func (m *MockPlanejamentoRepository) GetByMetodo(ctx context.Context, metodo string) ([]*entity.Planejamento, error) {
	var list []*entity.Planejamento
	for _, pl := range m.limits {
		if pl.Metodo == metodo {
			list = append(list, pl)
		}
	}
	return list, nil
}

func (m *MockPlanejamentoRepository) GetAll(ctx context.Context) ([]*entity.Planejamento, error) {
	var list []*entity.Planejamento
	for _, pl := range m.limits {
		list = append(list, pl)
	}
	return list, nil
}

func (m *MockPlanejamentoRepository) UpdatePercentual(ctx context.Context, metodo string, categoriaID uuid.UUID, percentual float64) error {
	key := metodo + "-" + categoriaID.String()
	pl, ok := m.limits[key]
	if !ok {
		pl = &entity.Planejamento{
			ID:          uuid.New(),
			Metodo:      metodo,
			CategoriaID: categoriaID,
		}
		m.limits[key] = pl
	}
	pl.Percentual = percentual
	return nil
}

func (m *MockPlanejamentoRepository) DeleteByMetodo(ctx context.Context, metodo string) error {
	for key, pl := range m.limits {
		if pl.Metodo == metodo {
			delete(m.limits, key)
		}
	}
	return nil
}

// MockSettingsRepository
type MockSettingsRepository struct {
	settings map[string]json.RawMessage
}

func NewMockSettingsRepository() *MockSettingsRepository {
	return &MockSettingsRepository{settings: make(map[string]json.RawMessage)}
}

func (m *MockSettingsRepository) Get(ctx context.Context, key string) (json.RawMessage, error) {
	val, ok := m.settings[key]
	if !ok {
		return nil, errors.New("not found")
	}
	return val, nil
}

func (m *MockSettingsRepository) Set(ctx context.Context, key string, value json.RawMessage) error {
	m.settings[key] = value
	return nil
}

func (m *MockSettingsRepository) GetAll(ctx context.Context) (map[string]json.RawMessage, error) {
	return m.settings, nil
}
