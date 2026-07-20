package usecase

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"saude-financeira-api/internal/application/dto"
	"saude-financeira-api/internal/domain/repository"
	"saude-financeira-api/internal/infrastructure/config"
)

type MigrationUseCase struct {
	repo       repository.MigrationRepository
	perfilRepo repository.PerfilRepository
	despRepo   repository.DespesaRepository
	finRepo    repository.FinanciamentoRepository
	metaRepo   repository.MetaRepository
	catRepo    repository.CategoriaRepository
	settings   repository.SettingsRepository
	cfg        *config.Config
}

func NewMigrationUseCase(
	repo repository.MigrationRepository,
	perfilRepo repository.PerfilRepository,
	despRepo repository.DespesaRepository,
	finRepo repository.FinanciamentoRepository,
	metaRepo repository.MetaRepository,
	catRepo repository.CategoriaRepository,
	settings repository.SettingsRepository,
	cfg *config.Config,
) *MigrationUseCase {
	return &MigrationUseCase{
		repo:       repo,
		perfilRepo: perfilRepo,
		despRepo:   despRepo,
		finRepo:    finRepo,
		metaRepo:   metaRepo,
		catRepo:    catRepo,
		settings:   settings,
		cfg:        cfg,
	}
}

func (uc *MigrationUseCase) ImportState(ctx context.Context, state *dto.LocalStorageState) (*dto.MigrationResult, error) {
	return uc.repo.ImportState(ctx, state, uc.cfg.UploadsPath)
}

func (uc *MigrationUseCase) GetFullState(ctx context.Context) (*dto.FullStateResponse, error) {
	// 1. Fetch Perfis
	perfis, err := uc.perfilRepo.GetAll(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch profiles: %w", err)
	}

	var dResponses []*dto.DespesaResponse
	var fResponses []*dto.FinanciamentoResponse
	var mResponses []*dto.MetaResponse
	var pResponses []*dto.PerfilResponse

	// Fetch all categories to map IDs to names
	cats, err := uc.catRepo.GetAll(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch categories: %w", err)
	}
	catMap := make(map[uuid.UUID]string)
	catCorMap := make(map[string]string)
	for _, c := range cats {
		catMap[c.ID] = c.Nome
		catCorMap[c.Nome] = c.Cor
	}

	// Fetch all investment categories
	invs, err := uc.catRepo.GetAllInvestimento(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch investment categories: %w", err)
	}
	invMap := make(map[uuid.UUID]string)
	for _, inv := range invs {
		invMap[inv.ID] = inv.Nome
	}

	for _, p := range perfis {
		pResponses = append(pResponses, &dto.PerfilResponse{
			ID:           p.ID.String(),
			Nome:         p.Nome,
			Salario:      p.Salario,
			FGTS:         p.FGTS,
			MetaBaseline: p.MetaBaseline,
			CreatedAt:    p.CreatedAt.Format(time.RFC3339),
			UpdatedAt:    p.UpdatedAt.Format(time.RFC3339),
		})

		// Fetch Despesas for profile
		despesas, err := uc.despRepo.GetByPerfil(ctx, p.ID)
		if err == nil {
			for _, d := range despesas {
				var subcatIDStr *string
				var subcatName *string
				if d.SubcategoriaInvestimentoID != nil {
					idStr := d.SubcategoriaInvestimentoID.String()
					subcatIDStr = &idStr
					name := invMap[*d.SubcategoriaInvestimentoID]
					subcatName = &name
				}

				var finIDStr *string
				if d.FinanciamentoID != nil {
					idStr := d.FinanciamentoID.String()
					finIDStr = &idStr
				}

				dResponses = append(dResponses, &dto.DespesaResponse{
					ID:                         d.ID.String(),
					PerfilID:                   d.PerfilID.String(),
					Descricao:                  d.Descricao,
					Valor:                      d.Valor,
					CategoriaID:                d.CategoriaID.String(),
					Categoria:                  catMap[d.CategoriaID],
					SubcategoriaInvestimentoID: subcatIDStr,
					SubcategoriaInvestimento:   subcatName,
					FinanciamentoID:            finIDStr,
					MesInicio:                  d.MesInicio,
					AnoInicio:                  d.AnoInicio,
					Parcelas:                   d.Parcelas,
					Recorrente:                 d.Recorrente,
					CreatedAt:                  d.CreatedAt.Format(time.RFC3339),
					UpdatedAt:                  d.UpdatedAt.Format(time.RFC3339),
				})
			}
		}

		// Fetch Financiamentos
		finances, err := uc.finRepo.GetByPerfil(ctx, p.ID)
		if err == nil {
			for _, f := range finances {
				fResponses = append(fResponses, &dto.FinanciamentoResponse{
					ID:             f.ID.String(),
					PerfilID:       f.PerfilID.String(),
					Nome:           f.Nome,
					ValorTotal:     f.ValorTotal,
					ValorParcela:   f.ValorParcela,
					ParcelasTotais: f.ParcelasTotais,
					TaxaTR:         f.TaxaTR,
					MesInicio:      f.MesInicio,
					AnoInicio:      f.AnoInicio,
					Sistema:        f.Sistema,
					TaxaJurosAnual: f.TaxaJurosAnual,
					CreatedAt:      f.CreatedAt.Format(time.RFC3339),
					UpdatedAt:      f.UpdatedAt.Format(time.RFC3339),
				})
			}
		}

		// Fetch Metas
		metas, err := uc.metaRepo.GetByPerfil(ctx, p.ID)
		if err == nil {
			for _, m := range metas {
				mResponses = append(mResponses, &dto.MetaResponse{
					ID:          m.ID.String(),
					PerfilID:    m.PerfilID.String(),
					Nome:        m.Nome,
					Valor:       m.Valor,
					Foto:        m.Foto,
					Comprado:    m.Comprado,
					Prioridade:  m.Prioridade,
					ValorTarget: m.ValorTarget,
					CreatedAt:   m.CreatedAt.Format(time.RFC3339),
					UpdatedAt:   m.UpdatedAt.Format(time.RFC3339),
				})
			}
		}
	}

	// 2. Fetch Settings
	settings, err := uc.settings.GetAll(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch settings: %w", err)
	}

	theme := settings["theme"]
	llmConfig := settings["llm_config"]
	ultimoBackup := settings["ultimo_backup"]

	return &dto.FullStateResponse{
		Perfis:         pResponses,
		Despesas:       dResponses,
		Financiamentos: fResponses,
		Metas:          mResponses,
		Categorias:     catCorMap,
		LLMConfig:      llmConfig,
		Theme:          theme,
		UltimoBackup:   ultimoBackup,
	}, nil
}
