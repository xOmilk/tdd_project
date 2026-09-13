# Projeto de Testes - Clínica Veterinária (TDD)

Este projeto foi desenvolvido aplicando as práticas de **TDD (Test-Driven Development)** na camada de negócio de um sistema para clínicas veterinárias. O objetivo é garantir a qualidade do código através da criação de testes unitários antes da implementação real das regras de negócio.

---

## 📋 Cobertura de Testes: Documentados (PDF) vs Implementados

Abaixo está o mapeamento completo dos testes sugeridos no documento do projeto e sua respectiva implementação na suíte de testes do repositório (`test/main.test.ts`). 

Todos os **23 cenários** listados no PDF foram devidamente implementados. Além deles, a suíte conta com testes adicionais focados nos utilitários da aplicação e na gestão de tutores (responsáveis).

### 🎯 Testes iniciais e objetivos principais (Regras de Negócio e Listas)

| Nº | Nome Original no PDF | Teste Implementado no Código | Descrição |
|----|----------------------|------------------------------|-----------|
| 1 | `test_calcular_valor_consulta_rotina` | ✅ "Calcular valor da consulta de rotina" | Verifica se uma consulta de rotina custa R$ 100,00. |
| 2 | `test_calcular_valor_consulta_urgencia` | ✅ "Calcular valor da consulta de urgência" | Confirma que uma consulta de urgência custa R$ 180,00. |
| 3 | `test_calcular_valor_atendimento_emergencia`| ✅ "Calcular valor do atendimento de emergência" | Valida que um atendimento de emergência custa R$ 250,00. |
| 4 | `test_acumular_valores_varios_atendimentos` | ✅ "Acumular valores de vários atendimentos" | Testa o acúmulo de valores em múltiplos atendimentos. |
| 5 | `test_consultar_total_gasto_animal_existente`| ✅ "Consultar total gasto por animal existente" | Verifica se a consulta retorna o total correto gasto pelo animal. |
| 6 | `test_aplicar_desconto_fidelidade` | ✅ "Aplicar desconto de fidelidade" | Garante desconto de 10% (animal possui >= 5 atendimentos). |
| 7 | `test_nao_aplicar_desconto_sem_fidelidade` | ✅ "Não aplicar desconto sem fidelidade" | O desconto não pode ser aplicado antes do requisito mínimo. |
| 8 | `test_calcular_atendimento_com_desconto` | ✅ "Calcular atendimento com desconto" | Valida o valor final após a aplicação do desconto. |
| 9 | `test_nao_permitir_valor_servico_zero` | ✅ "Não permitir valor de serviço zero" | Um serviço com valor zero não pode ser aceito. |
| 10 | `test_calcular_valores_decimais` | ✅ "Calcular valores decimais" | Confirma que valores adicionais decimais são calculados. |
| 11 | `test_nao_permitir_valor_negativo` | ✅ "Não permitir valor final negativo" | O valor final de um atendimento nunca pode ser negativo. |
| 12 | `test_animal_inexistente_lanca_excecao` | ✅ "Animal inexistente lança exceção" | O sistema lança erro ao consultar animal que não existe. |
| 13 | `test_registrar_novo_animal_sem_atendimentos`| ✅ "Registrar novo animal sem atendimentos" | Valida cadastro de animal inicialmente sem histórico. |
| 14 | `test_aplicar_acrescimo_procedimento_adicional`| ✅ "Aplicar acréscimo de procedimento adicional" | Testa a inclusão de um procedimento extra no valor final. |
| 15 | `test_identificar_retorno_dentro_do_periodo` | ✅ "Identificar retorno dentro do período" | Simula um retorno dentro de um período e aplica a regra. |
| 16 | `test_registrar_varios_animais_em_lista` | ✅ "Registrar vários animais em lista" | Valida inserção de múltiplos animais. |
| 17 | `test_calcular_total_gasto_lista_animais` | ✅ "Calcular total gasto da lista de animais" | Calcula gastos acumulados de todos os animais da lista. |
| 18 | `test_filtrar_animais_com_gasto_acima_de_limite`| ✅ "Filtrar animais com gasto acima de limite" | Filtra animais cujo gasto total supere um valor definido. |
| 19 | `test_ordenar_animais_por_total_gasto` | ✅ "Ordenar animais por total gasto" | Ordena animais conforme o total gasto acumulado. |
| 20 | `test_remover_animais_sem_atendimentos` | ✅ "Remover animais sem atendimentos" | Limpa da lista os animais sem histórico de atendimentos. |
| 21 | `test_buscar_animal_por_nome` | ✅ "Buscar animal por nome" | Busca específica de animal na lista pelo seu nome. |
| 22 | `test_somar_faturamento_total_lista` | ✅ "Somar faturamento total da lista" | Calcula valor total de faturamento envolvendo toda a lista. |
| 23 | `test_ranking_animais_por_total_gasto` | ✅ "Gerar ranking de animais por total gasto" | Ordena animais pelo total gasto de forma decrescente. |

---

###  Testes Adicionais Implementados (Utilitários e Serviços)

Para suportar o funcionamento correto da interface CLI simulada e relacionamentos do banco em memória, a suíte também abrange testes para **Utilitários** e para a entidade **PetOwner** (Tutores/Responsáveis):

#### Utilitários (`utils/index.ts`)
- `Validar data futura no utilitário`
- `Rejeitar data inválida ou passada no utilitário`
- `Rejeitar data de calendário inválida no utilitário`
- `Registrar pet pelo utilitário`
- `Registrar outro pet para responsável existente`
- `Listar pets cadastrados pelo utilitário`
- `Listar pets sem animais pelo utilitário`
- `Agendar consulta futura pelo utilitário`
- `Agendar consulta com procedimento adicional`
- `Não agendar consulta sem animais cadastrados`
- `Listar consultas sem atendimentos pelo utilitário`
- `Listar consultas registradas pelo utilitário`

#### Serviços de Responsáveis/Tutores (`pet-owner.service.ts`)
- `Registrar novo responsável`
- `Buscar responsável por e-mail`
- `Consultar animais do responsável`
- `Calcular total gasto pelo responsável`

---

## 🛠 Como Executar os Testes

Este projeto utiliza a biblioteca **Jest**. Para rodar toda a suíte de testes e visualizar a cobertura, utilize o seguinte comando na raiz do projeto:

```bash
npm test
```
