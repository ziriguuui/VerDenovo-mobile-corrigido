import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiService } from '../services/api';

const PontosContext = createContext(null);

// Mapeia o texto livre do campo "material" (vindo do backend) para os
// mesmos rótulos/categorias usados na interface do app.
const TIPOS = [
  { chave: 'Eletrônicos', termos: ['eletrônico', 'eletronico'] },
  { chave: 'Pilhas e Baterias', termos: ['pilha', 'bateria'] },
  { chave: 'Medicamentos', termos: ['medicamento', 'remédio', 'remedio'] },
  { chave: 'Papel e Plástico', termos: ['papel', 'plástico', 'plastico'] },
];

function inferirTipo(materialTexto) {
  const texto = (materialTexto || '').toLowerCase();
  for (const tipo of TIPOS) {
    if (tipo.termos.some((t) => texto.includes(t))) return tipo.chave;
  }
  return 'Geral';
}

function normalizarPonto(p) {
  return {
    id: String(p.id),
    nome: p.nome,
    tipo: inferirTipo(p.material),
    material: p.material,
    endereco: [p.logradouro, p.numero].filter(Boolean).join(', ') || p.cep,
    horaFuncionamento: p.horaFuncionamento,
    telefone: p.telefone,
    descricao: p.descricao,
    lat: p.latitude,
    lng: p.longitude,
    temCoordenadas: typeof p.latitude === 'number' && typeof p.longitude === 'number',
  };
}

export function PontosProvider({ children }) {
  const [pontos, setPontos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const dados = await apiService.listarPontos();
      setPontos(dados.map(normalizarPonto));
    } catch (e) {
      setErro(e.message || 'Não foi possível carregar os pontos de coleta.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return (
    <PontosContext.Provider value={{ pontos, loading, erro, recarregar: carregar }}>
      {children}
    </PontosContext.Provider>
  );
}

export function usePontos() {
  const context = useContext(PontosContext);
  if (!context) throw new Error('usePontos deve ser usado dentro de PontosProvider');
  return context;
}
