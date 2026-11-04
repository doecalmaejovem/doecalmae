# Calmaê Jovem — plano de desenvolvimento do zero

## Cenário 2 — um desenvolvedor sênior e um júnior

**Público:** presidente, administradores, parceiros e equipe da ONG.  
**Data:** 30 de outubro de 2026.  
**Dedicação aprovada para estimar:** 20 horas semanais por pessoa.  
**Entrega:** web + Android + iOS + operação inicial segura, com o mesmo escopo nos dois cenários.

## Resumo para apresentar em reunião

Duas pessoas não reduzem o prazo à metade. O júnior ajuda em telas, cadastros, testes, documentação e configuração orientada; o sênior continua responsável pelas decisões, segurança, banco, vídeo e revisão. O time precisa de mais horas-pessoa, mas consegue executar parte do trabalho em paralelo.

| Indicador | Planejamento |
| --- | --- |
| Pessoas e dedicação | 1 sênior + 1 júnior; 20h/semana cada (40h totais) |
| Capacidade semanal de entrega | 16h sênior + 16h júnior, além de 4h de coordenação para cada um |
| Esforço direto dos 44 tickets | 904h sênior + 912h júnior = 1816 horas-pessoa |
| Execução planejada, sem reservas | 74 semanas |
| Reserva de desenvolvimento (15%, arredondada) | 12 semanas |
| Reserva externa não absorvida em paralelo | 4 semanas para aprovações/lojas; não é garantia de prazo externo |
| Prazo total de referência | 90 semanas, aproximadamente 21 meses |
| Equipamentos iniciais, se comprar tudo | A partir de R$ 18.200; faixa completa na seção de orçamento |
| PRD mensal, com margem de 25% | R$ 1.375 a R$ 5.500, mais HML; envelope não cotado e sem salários |


**Como explicar o prazo:** aproximadamente 21 meses com duas pessoas de meio período, contra 27 meses com um sênior sozinho. Não anunciar uma data civil antes de aprovar as premissas. São semanas de calendário com a disponibilidade regular definida; férias, feriados e suspensões devem ser acrescentados. Os meses usam 4,345 semanas por mês e são arredondados.

A redução frente ao cenário solo é de 27 semanas (aproximadamente 23%); não de 50%. O esforço direto aumenta de 1568h para 1816h, por orientação, revisão e aprendizagem. O benefício adicional é continuidade e divisão de tarefas, não garantia de que o júnior substitua o sênior.

## O que a V1 inclui

A plataforma conecta participantes elegíveis a psicólogos e psiquiatras aprovados. Site, Android e iOS usam a mesma API e o mesmo banco; um agendamento feito no celular aparece no site. O plano inclui as interfaces, as regras, os testes, os ambientes e a entrega operacional, não apenas telas demonstrativas.

- **Paciente:** resgatar convite/código, confirmar e-mail, entrar e recuperar acesso, aceitar termos, consultar situação cadastral, profissionais aprovados, horários, cota e agendamentos; reservar, cancelar e entrar em consulta autorizada.
- **Profissional:** entrar por convite, usar autenticação em duas etapas, enviar credenciais, aguardar aprovação de CRP/CRM, manter disponibilidade, acompanhar agenda e atender por vídeo. Só Psicologia e Psiquiatria.
- **Menores e representantes:** percursos distintos para adulto, emancipado e menor representado; documentos privados e revisão manual; representante com vínculo verificado acompanha somente as informações administrativas autorizadas. Não acessa sala ou conversa.
- **Equipe da ONG:** área administrativa web para programas, convites, cotas, documentos, profissionais, bloqueios, exceções e trilha de ações. O acesso administrativo avançado não precisa ser reproduzido no app; paciente, profissional e representante têm os percursos móveis correspondentes.
- **Agenda:** duração fixa de 50 minutos; impedir duas reservas da mesma vaga e duplo consumo da última cota. Cancelar com pelo menos 24 horas devolve cota; abaixo disso ou em ausência confirmada consome cota, ressalvadas exceções aprovadas.
- **Vídeo:** LiveKit próprio, somente paciente e profissional vinculados, primeiro nome do outro participante, entrada a partir de cinco minutos antes, espera e reconexão. Criptografia ponta a ponta comprovada nos três canais; sem gravação/transcrição e sem acesso por adivinhar endereço.
- **Comunicação:** convites, confirmações, cancelamentos, recuperação e lembretes por e-mail; push nos celulares com permissão. Textos neutros, sem conteúdo clínico; falhas de envio são visíveis.
- **Qualidade e operação:** identidade visual da ONG, acessibilidade, autorização por papel, proteção de captura nos limites dos sistemas, dados de teste fictícios, monitoramento, backups/restauração, manuais, lojas e piloto controlado.

**Fora da V1:** cobrança do paciente, pagamentos empresariais, repasses, faturamento, prontuário, notas clínicas, diagnóstico automatizado, triagem clínica automatizada, biblioteca de autocuidado, índice emocional, portal de empresas, login social, gravação, transcrição, chat de consulta, anexos na sala, compartilhamento de tela, calendário externo e recorrência complexa de horários. Não há migração de dados históricos nem suporte 24 horas. Esses itens do material genérico original não foram incorporados ao escopo acordado.

## Premissas e limites da estimativa

1. Partida do zero. O código existente não reduz este orçamento. Reaproveitamento futuro só reduz prazo após avaliação e novo cálculo.
2. Dedicação informada: **20 horas semanais por pessoa**. Reservam-se 4 horas para alinhamento, demonstração, organização e comunicação; restam **16 horas de entrega por pessoa/semana**. Isso é hipótese de capacidade, a medir nas primeiras quatro semanas.
3. As horas dos tickets incluem análise de detalhe, implementação/configuração, testes próprios, correções ordinárias e revisão técnica. No time, a parcela do sênior inclui desenho, orientação técnica e revisão do trabalho do júnior; não são duas pessoas produzindo à mesma velocidade.
4. As 4 horas semanais de coordenação não reaparecem nas horas dos tickets. Revisão técnica de código é trabalho de entrega e está nos tickets. A reserva de 15% do prazo cobre incerteza e retrabalho extraordinário, não uma cobrança adicional já realizada.
5. Escopo estável, resposta da ONG em até 5 dias úteis e profissionais jurídico/clínico disponíveis nos marcos. Não há designer, QA, gerente ou DevOps dedicado: o sênior acumula essas atividades, com apoio de execução do júnior quando houver.
6. Homologação só usa dados sintéticos. Produção real depende de contratação apropriada e aceite institucional; plano pago não equivale a conformidade LGPD.
7. Uma língua (português do Brasil), um conjunto de regras por programa e versões de sistemas/navegadores explicitamente aprovadas na F02. Suporte a todas as versões históricas não está incluído.
8. Não foi contratado SLA de disponibilidade. A meta genérica de 99,9% do PRD de referência não é promessa deste plano: precisa de orçamento e desenho de redundância próprios antes de virar compromisso.
9. Horas são **horas-pessoa**, não horas corridas nem orçamento salarial. Semanas são contadas a partir de T0: dedicação e acessos confirmados. Os cronogramas não descontam feriados, férias, doença ou indisponibilidade; cada interrupção deve ser acrescentada.
10. Não existe garantia de entrega em uma data civil. Este é um planejamento inicial; reestimar após F02 e a prova técnica de vídeo. Mudanças clínicas/jurídicas ou achados graves podem exigir mais que a reserva.


## Equipe e responsabilidades

| Papel | Responsabilidade | Disponibilidade / limite |
| --- | --- | --- |
| Presidente/patrocinador | Aprovar escopo, orçamento, prioridades e liberação real; resolver impasses. | Presença nos marcos e delegado para respostas em até 5 dias úteis. |
| Responsável de produto da ONG | Responder regras e validar demonstrações em nome da operação. | Planejar 1 a 2h por semana, mais oficinas de aceite; não incluído nas horas de desenvolvimento. |
| Sênior | Liderar solução e dividir tarefas; implementar partes críticas; orientar e revisar o júnior; conduzir publicação. | 20h semanais totais; não inclui plantão 24x7. |
| Júnior | Executar telas, fluxos administrativos, testes, documentação e configuração sob orientação; sinalizar bloqueios. | 20h semanais; conhecimento básico de TypeScript/React e Git. Formação do zero não cabe neste prazo. |
| Jurídico/privacidade e responsável clínico | Aprovar menores, termos, retenção, contratos, emergência e regras de atendimento. | Serviço/responsabilidade externo à equipe de desenvolvimento; agenda e honorários separados. |
| Revisor independente de segurança | Avaliar controles críticos e evidência de E2EE antes do aceite. | Contratação pontual; as horas dos tickets cobrem preparação e correção, não honorários do revisor. |
| Operação e suporte | Conferir profissionais/documentos e atender ocorrências após lançamento. | Nomear titular/substituto e horário; não presumir que o desenvolvedor fará toda a operação. |


Divisão sugerida: o júnior entrega componentes e fluxos com critérios objetivos; o sênior define contratos, migrações, autorização, concorrência e chaves. A coluna de responsável no CSV indica o executor principal, não propriedade exclusiva. Os tickets têm esforço dos dois porque revisão e integração são necessárias.

## Cronograma de configurações e implementação

As fases abaixo são janelas de planejamento, não promessa de que cada pessoa ficará ocupada em cada hora. Atividades independentes podem começar antes para preparar a fase seguinte. A aceitação depende das integrações e dos pré-requisitos do catálogo.

| Fase | Grupo de entrega | Semanas desde T0 | Duração | Esforço direto | Tickets |
| --- | --- | --- | --- | --- | --- |
| F01 | Definições, aprovação e preparação | 1 a 3 | 3 | 40h sênior + 32h júnior | CJ-001, CJ-002, CJ-003, CJ-004 |
| F02 | Base técnica, ambientes e desenho das telas | 4 a 8 | 5 | 72h sênior + 64h júnior | CJ-005, CJ-006, CJ-007, CJ-008 |
| F03 | Acesso e proteção das contas | 9 a 15 | 7 | 96h sênior + 80h júnior | CJ-009, CJ-010, CJ-011, CJ-012 |
| F04 | Programas, convites, menores e responsáveis | 16 a 22 | 7 | 80h sênior + 96h júnior | CJ-013, CJ-014, CJ-015, CJ-016 |
| F05 | Profissionais, catálogo e disponibilidade | 23 a 27 | 5 | 56h sênior + 80h júnior | CJ-017, CJ-018, CJ-019, CJ-020 |
| F06 | Reservas, cotas e cancelamentos | 28 a 34 | 7 | 88h sênior + 80h júnior | CJ-021, CJ-022, CJ-023, CJ-024 |
| F07 | Aplicativos Android e iOS | 35 a 43 | 9 | 64h sênior + 144h júnior | CJ-025, CJ-026, CJ-027, CJ-028 |
| F08 | Consulta por vídeo protegida | 44 a 55 | 12 | 176h sênior + 80h júnior | CJ-029, CJ-030, CJ-031, CJ-032 |
| F09 | Comunicação e operação administrativa | 56 a 60 | 5 | 48h sênior + 80h júnior | CJ-033, CJ-034, CJ-035, CJ-036 |
| F10 | Qualidade, capacidade e preparação da produção | 61 a 69 | 9 | 128h sênior + 112h júnior | CJ-037, CJ-038, CJ-039, CJ-040 |
| F11 | Publicação, capacitação e lançamento | 70 a 74 | 5 | 56h sênior + 64h júnior | CJ-041, CJ-042, CJ-043, CJ-044 |


O piso de capacidade é a soma, por fase, do maior entre horas do sênior/16 e horas do júnior/16, arredondada para cima: 68 semanas. O cronograma usa **74 semanas**, acrescentando uma semana de encaixe técnico nas fases F03, F04, F06, F08, F10 e F11. Essas seis semanas acomodam dependências, integração e o piloto; não são novas horas de funcionalidades nem a reserva de 15%. Trabalho técnico já está nas 1816h dos tickets.

Sequência de referência após a base: semanas **75 a 86** reservadas para incerteza de desenvolvimento; semanas **87 a 90** representam reserva externa. No uso real, as reservas podem ser consumidas no meio das fases; desenhá-las no fim apenas evita escondê-las.

A contratação e a conferência de conta nas lojas começam na F01; pareceres jurídicos evoluem em paralelo. Não somar novamente toda a espera externa já absorvida no cronograma. As 4 semanas são uma hipótese de espera residual **adicional**, não limite dos fornecedores. Rejeições extensas ou falta de documentação podem excedê-la.

| Tipo de trabalho | Horas-pessoa diretas neste cenário | Como ler |
| --- | --- | --- |
| Governança | 72 | Classificação pelo objetivo principal da fase; soma sem duplicação. |
| Configuração | 136 | Base inicial F02; vídeo F08 e preparação PRD F10 também contêm configuração, não contabilizada duas vezes. |
| Implementação | 1248 | Classificação pelo objetivo principal da fase; soma sem duplicação. |
| Validação | 240 | Classificação pelo objetivo principal da fase; soma sem duplicação. |
| Lançamento | 120 | Classificação pelo objetivo principal da fase; soma sem duplicação. |


Tempo de máquinas/acessos e compras: F01. Primeira homologação online: F02. Servidor de vídeo e chaves: F08. Preparação PRD, alertas e restauração: F10. Lojas e aceite: F11. Não confundir “ambiente online” com “liberado para pacientes reais”.

### Duração de cada ticket

| ID | Entrega | Sênior | Júnior | Total | Dependências para aceite |
| --- | --- | --- | --- | --- | --- |
| CJ-001 | Aprovar o escopo e os responsáveis pela V1 | 12h | 8h | 20h | Nenhuma |
| CJ-002 | Detalhar as regras e validar os percursos das pessoas | 12h | 8h | 20h | CJ-001 |
| CJ-003 | Definir privacidade, consentimentos e orientação de emergência | 8h | 8h | 16h | CJ-001 |
| CJ-004 | Preparar equipamentos, contas institucionais e compras | 8h | 8h | 16h | Nenhuma |
| CJ-005 | Criar a base do projeto e a esteira de publicação | 24h | 16h | 40h | CJ-001, CJ-004 |
| CJ-006 | Estruturar o banco e suas mudanças controladas | 24h | 16h | 40h | CJ-002, CJ-003, CJ-005 |
| CJ-007 | Configurar homologação e o armazenamento privado de teste | 12h | 16h | 28h | CJ-003, CJ-005 |
| CJ-008 | Desenhar as telas e a identidade visual acessível | 12h | 16h | 28h | CJ-001, CJ-002 |
| CJ-009 | Implementar entrada por e-mail e senha | 24h | 24h | 48h | CJ-005, CJ-006, CJ-008 |
| CJ-010 | Exigir MFA e controlar sessões e permissões | 32h | 16h | 48h | CJ-009 |
| CJ-011 | Permitir recuperação segura da conta | 16h | 24h | 40h | CJ-009, CJ-010 |
| CJ-012 | Registrar ações sensíveis e testar a separação de acessos | 24h | 16h | 40h | CJ-006, CJ-009, CJ-010 |
| CJ-013 | Gerenciar programas, convites e códigos de acesso | 16h | 24h | 40h | CJ-006, CJ-009, CJ-010 |
| CJ-014 | Cadastrar e habilitar pacientes adultos | 24h | 24h | 48h | CJ-013 |
| CJ-015 | Enviar e revisar documentos de menores e emancipados | 24h | 24h | 48h | CJ-003, CJ-007, CJ-013 |
| CJ-016 | Vincular o responsável legal e sua área administrativa | 16h | 24h | 40h | CJ-010, CJ-014, CJ-015 |
| CJ-017 | Publicar a apresentação do serviço e o catálogo | 8h | 16h | 24h | CJ-008, CJ-013 |
| CJ-018 | Cadastrar, validar e aprovar profissionais | 16h | 24h | 40h | CJ-010, CJ-013, CJ-017 |
| CJ-019 | Organizar a disponibilidade do profissional | 16h | 24h | 40h | CJ-006, CJ-018 |
| CJ-020 | Permitir bloqueios e revisão da agenda pela equipe | 16h | 16h | 32h | CJ-012, CJ-019 |
| CJ-021 | Reservar horários sem dupla marcação | 32h | 24h | 56h | CJ-014, CJ-015, CJ-019 |
| CJ-022 | Apresentar e controlar a cota mensal | 24h | 24h | 48h | CJ-006, CJ-013, CJ-021 |
| CJ-023 | Aplicar cancelamento e ausência com a regra das 24 horas | 16h | 16h | 32h | CJ-020, CJ-021, CJ-022 |
| CJ-024 | Concluir os painéis de paciente e profissional | 16h | 16h | 32h | CJ-017, CJ-021, CJ-022, CJ-023 |
| CJ-025 | Preparar os aplicativos e o acesso seguro nos aparelhos | 16h | 32h | 48h | CJ-005, CJ-009, CJ-010, CJ-011 |
| CJ-026 | Oferecer cadastro, documentos e vínculo familiar no app | 16h | 40h | 56h | CJ-014, CJ-015, CJ-016, CJ-025 |
| CJ-027 | Oferecer profissionais, agenda, reservas e cotas no app | 16h | 40h | 56h | CJ-018, CJ-019, CJ-021, CJ-022, CJ-023, CJ-024, CJ-025 |
| CJ-028 | Ajustar experiência mobile e proteção da tela | 16h | 32h | 48h | CJ-025, CJ-026, CJ-027 |
| CJ-029 | Instalar e operar o serviço próprio de vídeo | 32h | 16h | 48h | CJ-004, CJ-007 |
| CJ-030 | Proteger a sala e implementar criptografia ponta a ponta | 64h | 24h | 88h | CJ-010, CJ-016, CJ-021, CJ-029 |
| CJ-031 | Construir a sala de consulta no site | 40h | 24h | 64h | CJ-008, CJ-024, CJ-029, CJ-030 |
| CJ-032 | Construir a sala nativa e testar chamadas entre plataformas | 40h | 16h | 56h | CJ-025, CJ-028, CJ-029, CJ-030, CJ-031 |
| CJ-033 | Enviar convites, confirmações e lembretes por e-mail | 8h | 16h | 24h | CJ-007, CJ-011, CJ-013, CJ-021, CJ-023 |
| CJ-034 | Enviar notificações autorizadas aos celulares | 16h | 24h | 40h | CJ-025, CJ-027, CJ-033 |
| CJ-035 | Consolidar a área de operação da ONG | 16h | 24h | 40h | CJ-012, CJ-013, CJ-015, CJ-018, CJ-020, CJ-022, CJ-023 |
| CJ-036 | Organizar suporte e indicadores operacionais mínimos | 8h | 16h | 24h | CJ-012, CJ-024, CJ-033, CJ-034, CJ-035 |
| CJ-037 | Automatizar os testes completos e de regressão | 40h | 32h | 72h | CJ-016, CJ-024, CJ-028, CJ-032, CJ-034, CJ-035 |
| CJ-038 | Revisar segurança, privacidade e facilidade de uso | 24h | 32h | 56h | CJ-003, CJ-012, CJ-028, CJ-030, CJ-032, CJ-035, CJ-037 |
| CJ-039 | Medir capacidade, vídeo e recuperação de conexão | 32h | 24h | 56h | CJ-029, CJ-032, CJ-033, CJ-037 |
| CJ-040 | Preparar produção, backups, alertas e restauração | 32h | 24h | 56h | CJ-003, CJ-006, CJ-007, CJ-029, CJ-036, CJ-039 |
| CJ-041 | Preparar e submeter os aplicativos às lojas | 16h | 24h | 40h | CJ-004, CJ-028, CJ-032, CJ-034, CJ-038, CJ-040 |
| CJ-042 | Treinar a operação e entregar os manuais | 8h | 16h | 24h | CJ-035, CJ-036, CJ-038, CJ-040 |
| CJ-043 | Realizar o aceite institucional em homologação | 16h | 8h | 24h | CJ-037, CJ-038, CJ-039, CJ-040, CJ-041, CJ-042 |
| CJ-044 | Executar piloto controlado e encerrar a entrega | 16h | 16h | 32h | CJ-041, CJ-042, CJ-043 |


Para um ticket solo, horas/16 é a quantidade de semanas de capacidade se ele ocupar sozinho a fila. No time, não somar as duas parcelas como prazo corrido: atividades podem ocorrer em paralelo e a revisão pode esperar. Por isso o compromisso gerencial usa a janela da fase, não uma soma ingênua de horas dividida por 40.

## Equipamentos necessários

| Item | Um sênior | Sênior + júnior | Especificação e condição | Finalidade |
| --- | --- | --- | --- | --- |
| Notebook principal | 1 | 1 | Mac com Apple Silicon, 24 GB de memória recomendados (16 GB como piso), SSD de 512 GB ou maior, macOS compatível com Xcode vigente. | Necessário para testar e depurar iOS localmente. Mac já existente compatível pode ser reutilizado. |
| Notebook do júnior | 0 | 1 | Windows 11 ou Mac/Linux compatível; 16 GB de memória como piso, 32 GB recomendados, SSD de 512 GB, processador recente com virtualização. | Acesso ao Mac do sênior para testes iOS; não é obrigatório comprar um segundo Mac. |
| Celular Android | 1 | 1 compartilhado | Aparelho físico intermediário com câmera/microfone, 6 GB de memória recomendados, sistema ainda suportado, Wi-Fi e chip de dados. | Testar permissões, notificações, chamada, captura, segundo plano e rede móvel. |
| iPhone | 1 | 1 compartilhado | Aparelho físico capaz de executar a versão mínima de iOS que será escolhida na F02 e ainda com suporte de segurança. | Não comprar modelo sem verificar suporte. Simulador não substitui câmera, push e comportamento real. |
| Segundo par Android/iPhone | Emprestado quando necessário | Emprestado quando necessário | Um segundo aparelho de cada sistema, preferencialmente com versão/tamanho diferentes, disponível nas fases F07 a F11. | Para Android-Android e iOS-iOS e comparação de versões; pode ser emprestado pela ONG, sem compra inicial. |
| Acessórios e conectividade | 1 posto + kit de teste | 2 postos + kit de teste | Headsets com microfone; webcam se necessária; monitor externo recomendado; internet estável e plano móvel de operadora diferente quando possível. | Duas redes independentes para simular paciente e profissional; não contar apenas com emuladores na mesma máquina. |


As quantidades são para desenvolvimento/testes, não equipamentos para 1.000 pacientes. Cada profissional e paciente precisará de dispositivo, câmera, microfone e conexão próprios; a ONG deve confirmar se haverá empréstimo ou ponto de atendimento assistido. Equipamento emprestado para testes deve permanecer disponível nos marcos, não só no dia da compra.

Não é obrigatório ter um servidor físico na ONG. Computação, banco, arquivos e vídeo ficarão em serviços online. Se o sênior já tem notebook Windows, pode mantê-lo, mas o plano requer acesso regular a um Mac para iOS; EAS gera builds em nuvem, porém não elimina a necessidade prática de testar/depurar em ambiente Apple.

## Serviços e servidores a contratar ou provisionar

| Necessidade | Fornecedor candidato | Quando | Para que serve | Quantidade / cuidados |
| --- | --- | --- | --- | --- |
| Código e Kanban | GitHub e GitHub Projects, ou ferramenta equivalente | F01 | Organização institucional, repositório privado, tarefas e revisão de mudanças. | Uma organização; acessos individuais para 1 ou 2 desenvolvedores e gestores. Plano gratuito apenas se recursos e termos atenderem. |
| Domínio e DNS | Registro.br e DNS gerenciado, ou equivalente | F01/F02 | Endereço oficial e subdomínios separados para teste e produção. | Um domínio anual; controle da ONG; HTTPS e alertas de renovação. |
| Hospedagem do site | Vercel | HML em F02; PRD antes de F10 | Publicar Next.js e controlar versões. | Projetos HML/PRD separados; plano/assentos e uso permitidos precisam ser cotados. ONG não implica Hobby elegível. |
| Servidor da aplicação | Railway | HML em F02; PRD em F10 | Executar a API e o processamento de lembretes. | Serviço HML e PRD separados; ponto de partida PRD de 1 a 2 vCPU e 1 a 2 GB RAM, a medir. Worker separado apenas se o desenho exigir; não duplicar custo sem necessidade. |
| Banco de dados | Neon PostgreSQL; alternativa sujeita à região/contrato | F02/F10 | Guardar contas, agenda, cotas e vínculos de forma comum aos canais. | Bancos HML/PRD separados, conexões controladas, TLS, backup/PITR conforme política; hipótese inicial de 10 GB PRD, sem arquivos dentro do banco. |
| Arquivos privados | Amazon S3, ou serviço compatível aprovado | HML em F02; PRD em F10 | Guardar comprovantes com acesso restrito, prazo e descarte. | Buckets e credenciais separados, criptografia e acesso temporário; hipótese inicial de 20 GB PRD, proteção contra arquivo malicioso. Confirmar região e custo de leitura/cópia. |
| Servidor de vídeo | LiveKit auto-hospedado em VM de provedor com região aprovada | F08; PRD em F10 | Transportar áudio/vídeo sem gravação ou transcrição. | HML: referência inicial 2 vCPU/4 GB. PRD: referência inicial 4 vCPU/8 GB, rede pública UDP/TURN e certificados. Uma instância ativa não é alta disponibilidade; redundância/Redis dependem da meta aprovada. |
| E-mail de serviço | Resend ou Amazon SES, sujeito a contrato | Teste F02; integração F09 | Convites, confirmação, recuperação e lembretes. | Remetente autenticado, fila e alertas; produção fora do modo de testes; sem conteúdo clínico. |
| Build e entrega mobile | Expo EAS, APNs e FCM | Primeiro build F07; finalizar F11 | Gerar/assinar aplicativos e entregar notificações. | Projeto institucional, credenciais separadas, plano conforme fila de builds; não substitui hospedagem da API. |
| Lojas de aplicativos | Apple Developer Program e Google Play Console | Iniciar F01; submeter F11 | Publicar Android/iOS oficialmente pela ONG. | Validar conta de organização, documentação e eventuais identificadores exigidos. Taxas/isenções e testes fechados dependem da elegibilidade; não presumir concessão. |
| Monitoramento e recuperação | Sentry ou equivalente, uptime e backups do provedor | Iniciar F02; consolidar F10 | Avisar falhas, medir gastos e restaurar dados. | Sem gravação de sessão ou conteúdo clínico. Retenção aprovada, alertas com responsável e testes de restauração; backup de arquivos não é só backup do banco. |
| Gestão de acessos e documentos | Cofre de senhas institucional e ferramenta de reunião/documentos | F01 | Preservar posse dos acessos e decisões da ONG. | Acessos individuais, MFA e recuperação institucional; documentos jurídicos e contratos em pasta restrita. |


Os fornecedores são candidatos, não contratos fechados. Confirmar região, operadores/suboperadores, transferências internacionais, SLA, limites, backup e elegibilidade da ONG. API e banco devem ficar próximos geograficamente. Vídeo usa infraestrutura de rede própria, não uma função serverless da Vercel. O nome LiveKit designa a tecnologia; neste escopo a ONG opera sua instalação, não há contratação automática de LiveKit Cloud.

HML (homologação) é o local para a ONG conferir a aplicação com pessoas e dados fictícios; PRD (produção) é o ambiente com uso real. Podem ser projetos na mesma conta institucional, mas os dados, arquivos e segredos devem ser separados. Testar com serviços gratuitos é aceitável apenas se os termos e limites permitirem; consultas reais não dependem de suspensão automática ou franquia experimental.


## O que significa atender 1.000 pacientes

Mil cadastros não significam mil consultas ao mesmo tempo. O dimensionamento inicial proposto é de **até 10 consultas simultâneas** (20 participantes) e 1.000 contas cadastradas; a ONG deve aprovar essa hipótese em D10. A quantidade de profissionais, horas de agenda e suporte disponíveis limita a operação tanto quanto o software.

Exemplo de consumo, não previsão contratada: 1.000 pessoas com uma sessão de 50 minutos por mês representam **50.000 minutos de sala e 100.000 minutos de participante por mês**. Com tráfego de saída médio hipotético de 2 megabits/s por participante, isso equivale a cerca de **1,5 TB de saída de mídia por mês**, antes de variações, retransmissões e custos de TURN. A resolução e a rede podem alterar bastante esse consumo.

A máquina de vídeo 4 vCPU/8 GB é só ponto de partida para ensaio, não prova de capacidade. A F10 mede 10 salas simultâneas, concorrência de agenda e consumo. Se a necessidade real for maior, ampliar e testar antes de abrir novas vagas; não prometer 1.000 simultâneos.

Meta inicial proposta para a agenda/API: 50 pessoas simultâneas, 20 operações por segundo por 15 minutos, p95 de leitura de até 2 segundos e erros técnicos abaixo de 1%, sem dupla reserva. A ONG aprova metas e redes de referência; a qualidade de vídeo é avaliada à parte em chamadas de 50 minutos entre plataformas.


## Orçamento de planejamento e contratações

**Valores indicativos em reais, sem cotação confirmada em 30/10/2026.** A consulta online aos fornecedores não pôde ser concluída pela rede disponível. As faixas abaixo são envelopes gerenciais, não preços oficiais, promessa de plano gratuito ou autorização de compra. Solicitar cotação, impostos, câmbio e termos na data da contratação.

| Investimento inicial | Quantidade a comprar se nada existir | Faixa por unidade | Observação |
| --- | --- | --- | --- |
| Notebook Mac principal | 1 | R$ 8.500 a R$ 15.000 | Investimento único; faixa estimada, não cotação de modelo. |
| Notebook adicional do júnior | 1 | R$ 4.000 a R$ 7.000 | Reutilizar equipamento compatível reduz ou elimina a compra. |
| Android de testes | 1 | R$ 1.300 a R$ 2.500 | Uma unidade compartilhada no cenário de dois desenvolvedores. |
| iPhone de testes | 1 | R$ 3.000 a R$ 6.000 | Faixa de planejamento; verificar suporte, procedência e estado. |
| Acessórios por posto | 2 | R$ 700 a R$ 1.800 | Headset, eventual monitor/adaptadores; deduzir itens disponíveis. |


**Equipamentos: R$ 18.200 a R$ 34.100**, se todos os itens dessa lista precisarem ser comprados. Reutilização/empréstimo pode reduzir bastante. Segundo par de celulares é previsto por empréstimo; se indisponível, cotar à parte.

| Serviços de produção (mensal) | Envelope mínimo | Envelope superior |
| --- | --- | --- |
| Web + API/rotina de lembretes + banco | R$ 350 | R$ 1.100 |
| Vídeo próprio: máquina e tráfego inicial | R$ 500 | R$ 2.200 |
| Storage privado, e-mail, backup e monitoramento | R$ 150 | R$ 600 |
| Build mobile, ferramentas e acessos | R$ 100 | R$ 500 |


**Envelope mensal de produção: R$ 1.100 a R$ 4.400.** Reservar mais 25% para oscilação de uso/câmbio resulta em **R$ 1.375 a R$ 5.500/mês**. Não é teto: alta disponibilidade, maior concorrência, tráfego, contratos empresariais ou retenção podem exigir mais. Os dois cenários têm a mesma aplicação e carga-alvo; dois desenvolvedores não duplicam os servidores de produção.

Durante desenvolvimento, reservar **R$ 200 a R$ 800/mês para HML**, mais 25% de margem (R$ 250 a R$ 1.000). Planos gratuitos podem reduzir essa conta, sem garantia de disponibilidade de todas as integrações. HML continua depois do lançamento e deve ser somada à conta de PRD; produção não substitui homologação.

Fora desses totais: salários/contratos dos desenvolvedores, consultoria jurídica e clínica, revisão independente de segurança, taxas das lojas, domínio anual, eventual internet adicional, contratação de suporte e de redundância. Apple/Google e EAS têm formas diferentes de cobrança e eventuais benefícios para organizações elegíveis; consultar fonte oficial, sem presumir isenção.

Para estimar contratação por hora: **904 × valor/hora do sênior + 912 × valor/hora do júnior** cobre apenas os tickets de entrega. Acrescentar remuneração das horas de coordenação, disponibilidade contratada nas janelas e eventual uso da reserva. Se o vínculo for por salário mensal, usar meses de contratação do cronograma, e não multiplicar as horas dos tickets novamente. Uma estimativa de esforço não é autorização de faturamento.

Ao contratar, registrar em cada serviço: titular, responsável técnico, substituto, método de cobrança, limite/alerta de gasto, região, dados tratados, backup, prazo de guarda, renovação e como exportar/encerrar sem perder dados.


## Decisões que a ONG ainda precisa fechar

Estas são perguntas de requisito, não decisões tomadas em nome da ONG. As propostas permitem estimar, mas devem ser aprovadas antes da implementação afetada. Se rejeitadas, revisar escopo e prazo.

| Código | Assunto | Quem aprova | Prazo de decisão | Definição necessária / proposta |
| --- | --- | --- | --- | --- |
| D01 | Fuso, calendário e exibição | Operação + sênior | Fim de F01 | Proposta: referência America/Sao_Paulo para o programa, instantes preservados e fuso explícito na tela. Confirmar se haverá pessoas em outros fusos. |
| D02 | Ciclo da cota e mudanças de programa | Gestor do programa | Fim de F01 | Proposta: mês civil do início da sessão, uma cota por paciente no programa ativo, sem acumular saldo. Aprovar efeito de mudança de cota, programa e cancelamento entre meses. |
| D03 | Validade de convites e códigos | Operação + privacidade | Fim de F01 | Proposta: convite individual de uso único válido por 7 dias; códigos coletivos com prazo e limite expressos, sem associação automática por domínio de e-mail. |
| D04 | Poderes e vínculo do representante | Jurídico + responsável clínico | Fim de F01 | Confirmar como provar vínculo, quem pode reservar/cancelar pelo menor, restrições de notificações e encerramento ao atingir maioridade. Sem acesso à sala ou conteúdo clínico. |
| D05 | Visibilidade dos profissionais | Produto + profissionais | Antes de F05 | Proposta: apresentação do serviço pública; catálogo e disponibilidade completos após login. Publicar perfis fora do portal somente mediante autorização específica. |
| D06 | Ausência e contestação | Responsável clínico + operação | Antes de F06 | Confirmar tolerância de atraso, quem declara ausência, prazo de contestação e como tratar falha de conexão. Não inferir ausência só por falha técnica de entrada. |
| D07 | Janela final da sala e troca de aparelho | Responsável clínico + sênior | Antes de F08 | Entrada em T-5 minutos já confirmada. Proposta para aprovação: término em T+50 minutos, aviso e 5 minutos de encerramento; um dispositivo por participante e troca revoga o anterior. Reentrada e exceções devem ser aprovadas. |
| D08 | Guarda, exclusão e recuperação de dados | Jurídico/privacidade + presidente | Antes de F04 para documentos; ratificar antes de F10 | Definir prazos por tipo de dado, descarte de cópias e quem atende direitos. Propor RPO até 24h e RTO até 4h, sujeito ao impacto clínico e orçamento; não são política vigente. |
| D09 | Cancelamento por profissional, suspensão e exceções | Operação + responsável clínico | Antes de F05 | Proposta: cancelar por indisponibilidade do profissional/ONG devolve cota e avisa paciente, mesmo dentro de 24h. Não remover reserva sem comunicação; definir quem pode conceder exceção. |
| D10 | Capacidade, lembretes e suporte | Presidente + operação + sênior | Antes de F09/F10 | Propostas: lembretes 24h e 1h antes, sem avisos duplicados para reservas tardias; capacidade inicial de 10 consultas simultâneas e testes descritos em CJ-039; atendimento de suporte em horário comercial a definir, não 24x7. |


Um atraso de aprovação não autoriza o desenvolvedor a adivinhar a regra. Registrar o bloqueio e seu impacto no marco. Alterações relevantes após aprovação geram pedido de mudança, com horas, custo e data revisados.


## Como montar e administrar o Kanban

Importar o CSV do cenário escolhido. Os 44 IDs são os mesmos nos dois arquivos: **não importar os dois CSVs no mesmo board**, pois representam duas estimativas alternativas da mesma entrega. A dependência acompanha o ID; a ferramenta pode exigir vincular manualmente os relacionamentos após importar. O arquivo não depende de um produto específico.

Colunas: **Backlog → Pronto para iniciar → Em andamento → Em revisão técnica → Em validação da ONG → Concluído**. Usar **Bloqueado** como indicador e fila visível, sempre com motivo, responsável pelo desbloqueio e data de acompanhamento. Não tratar bloqueado como concluído. Classificar prioridade P0 significa obrigatório para esta V1, não incidente emergencial.

- Cada ticket contém objetivo, trabalho incluído, canais, pré-requisitos para aceite, testes/evidências, horas e responsável sugerido. Dependência é requisito para concluir a integração; protótipos ou telas podem começar antes com contrato aprovado, sem marcar conclusão antes da integração real.
- Entrada em “Pronto”: regra de negócio aprovada, equipamentos/acessos disponíveis, dependências conhecidas e aceite compreendido. Não começar upload real sem política de documentos.
- Limite de trabalho em andamento: um ticket principal por desenvolvedor; no time, até dois em execução e no máximo dois aguardando revisão. Quando a revisão acumular, parar de iniciar e terminar o que já existe.
- No cenário solo, o sênior executa e faz a revisão estruturada por checklist; isso não substitui revisão independente dos controles críticos em CJ-038. No time, o sênior revisa mudanças do júnior; o júnior não aprova sozinho autenticação, autorização, banco ou E2EE.
- Conclusão exige código/configuração persistente, testes previstos, documentação atualizada, evidência sem dados reais e aceite da pessoa competente. “Tela pronta” sem API, autorização ou teste não é concluído.
- Toda semana: revisar bloqueios, horas realizadas e capacidade restante. A cada duas semanas: demonstrar fluxo funcionando. Reestimar ao final da F02, da prova E2EE e de cada marco.
- Quebrar tickets grandes em tarefas de até 16 horas antes de iniciar. As tarefas herdam o ID-pai e não somam novo orçamento por cima do pai; o total do pai é redistribuído.
- Não anexar documento pessoal, senha, token, chave de vídeo ou gravação de consulta ao board. Evidências devem ser sintéticas e contratos restritos ficam em pasta institucional.


## Marcos de aceite, riscos e liberação

- **Fim de F01:** escopo, regras iniciais, responsáveis e compras aprovados; cadastros nas lojas iniciados.
- **Fim de F02:** projeto reproduzível, HML online, banco com migrações, armazenamento privado de teste e protótipos aceitos.
- **Fim de F06:** jornada web sintética completa de convite a reserva/cancelamento e cota.
- **Fim de F07:** fluxos móveis instalados em aparelhos reais, ainda sem autorizar atendimento real.
- **Fim de F08:** chamadas protegidas entre todas as plataformas demonstradas. Sem prova E2EE, a sala continua indisponível, mesmo que o restante esteja pronto.
- **Fim de F10:** testes, segurança, termos, capacidade, produção e restauração aprovados; pendências bloqueadoras impedem avançar.
- **Fim de F11:** lojas aprovadas, equipe treinada, aceite institucional e piloto real controlado acompanhado por pelo menos duas semanas. Essa é a entrega completa, não apenas a primeira publicação.

Principais riscos e resposta:

| Risco | Efeito | Resposta / responsável |
| --- | --- | --- |
| Disponibilidade de meio período | Fila de suporte ou decisão atrasar toda a execução | ONG protege 20h/semana por pessoa, nomeia produto e não promete suporte 24x7. |
| Dependência do sênior | Ausência interrompe banco, segurança e vídeo | Documentar, cofre institucional e revisão externa; com júnior há apoio, não substituição imediata. |
| Compatibilidade nativa e E2EE | Retrabalho e bloqueio das chamadas | Prova técnica antecipada na F08; experimentar SDKs no início da F02/F07 sem anunciar sala pronta. Não trocar por vídeo sem E2EE. |
| Regras de menores/privacidade | Refazer formulários ou impedir atendimento | Jurídico e clínico aprovam antes da fase afetada; bloqueio explícito. |
| Lojas e documentação da organização | Atrasar a distribuição mesmo com código pronto | Iniciar cadastro na F01; manter responsável institucional e canal de testes permitido. |
| Serviços gratuitos, contratos e região | Suspensão, custo inesperado ou operação inadequada | Testes sintéticos; cotar antes de PRD e não assumir elegibilidade da ONG. |
| Vídeo e tráfego | Aumentar gasto ou degradar consulta | Medir simultaneidade e qualidade; alertas e limitar novas vagas à capacidade testada. |
| Revisão independente não contratada | Não conseguir liberar controles sensíveis com confiança | Reservar contratação e agenda na F01; honorários separados, apoio de desenvolvimento nos tickets. |


Antes do primeiro paciente real, exigir assinatura do patrocinador e aceite técnico, jurídico/privacidade, clínico e operacional. Deve haver E2EE comprovada, arquivos privados, termos aprovados, profissional validado, MFA, restauração testada, lojas liberadas, protocolo de emergência e suporte definido. Não substituir isso por “o sistema abre no navegador”.

Falha grave de acesso, chave/documento exposto, ausência de E2EE ou risco operacional bloqueia lançamento. Sem correção e novo teste não há liberação. A operação precisa de responsável por alertas e substituto; um desenvolvedor contratado por 20h/semana não fornece automaticamente cobertura ininterrupta.


## Pequeno glossário para a reunião

- **API:** serviço central que recebe os pedidos do site e dos aplicativos, verifica permissões e consulta os dados.
- **HML:** homologação; ambiente de teste com dados fictícios. **PRD:** produção; ambiente de uso real.
- **MFA:** confirmação adicional de acesso por aplicativo autenticador, além da senha.
- **E2EE:** criptografia ponta a ponta; o conteúdo da mídia deve ser acessível somente aos dois participantes autorizados, não ao servidor de vídeo.
- **Servidor/VM:** computador contratado na nuvem. **vCPU/RAM/SSD:** capacidade de processamento, memória e armazenamento.
- **Backup e restauração:** cópia de segurança e prova de que a cópia pode ser usada para recuperar o serviço.
- **RPO de 24h:** meta proposta de perder no máximo as últimas 24 horas de alterações em desastre. **RTO de 4h:** meta proposta de voltar ao serviço em até 4 horas. Precisam de aprovação e teste.
- **p95 de 2 segundos:** pelo menos 95 de cada 100 leituras medidas no teste terminam em até 2 segundos, nas condições descritas.
- **SLA:** compromisso contratual de nível de serviço; uma meta interna não é automaticamente um SLA.
- **Ticket e Kanban:** uma entrega com critérios de conclusão e o quadro que mostra sua situação.
- **Migração do banco:** mudança controlada da estrutura dos dados, com registro de versão.
- **Rollback:** voltar a uma versão anterior do sistema; não significa apagar dados para corrigir problema.


## Como aprovar este plano

1. Confirmar que 20h semanais por pessoa estarão efetivamente disponíveis.
2. Nomear responsáveis de produto, operação, jurídico/privacidade e clínico.
3. Aprovar escopo, exclusões e decisões iniciais; cotar equipamentos e serviços.
4. Confirmar capacidade e horários dos profissionais; escolher cobertura de suporte.
5. Autorizar a F01 e revisar a estimativa ao final da F02, sem prometer liberação real antecipada.

## Fontes, rastreabilidade e validade

Escopo baseado na [visão da V1 para administradores](../visao-da-versao-1-administradores.md), nas [decisões de tecnologia](../technology-decisions.md) e no [guia de ambientes](../deploy-qa-hml-prd.md). O BUILD e o PRD genérico são referências históricas: funcionalidades excluídas pela decisão da V1 não foram reintroduzidas.

O [catálogo de tickets](catalogo-tickets-kanban.md) detalha os 44 itens, critérios e esforço dos dois cenários. Não existe um conjunto diferente de funcionalidades para o júnior: mudam divisão do trabalho, esforço e calendário.

Fontes oficiais para cotar e verificar termos (URLs de referência; preços não confirmados nesta elaboração):

- [Vercel](https://vercel.com/pricing)
- [Railway](https://railway.com/pricing)
- [Neon](https://neon.com/pricing)
- [Expo EAS](https://expo.dev/pricing)
- [LiveKit: instalação própria](https://docs.livekit.io/transport/self-hosting/)
- [LiveKit: criptografia ponta a ponta](https://docs.livekit.io/home/client/tracks/encryption/)
- [Amazon S3](https://aws.amazon.com/s3/pricing/)
- [Apple Developer Program](https://developer.apple.com/programs/enroll/)
- [Google Play: cadastro](https://support.google.com/googleplay/android-developer/answer/6112435)
- [Registro.br](https://registro.br/)

Documento elaborado em 30/10/2026. Estimativa gerencial inicial, não contrato, laudo jurídico, certificação de segurança ou compromisso dos fornecedores. Alteração de disponibilidade, escopo ou requisito exige revisar este plano.

