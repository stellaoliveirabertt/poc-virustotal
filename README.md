# POC de Automação de Escaneamento de Arquivos com VirusTotal

Este projeto é uma prova de conceito (POC) que automatiza o processo de envio de um arquivo ao VirusTotal para escaneamento, verificando periodicamente o status do escaneamento até que o resultado esteja disponível. Quando o escaneamento for concluído, o tempo total gasto é exibido e os resultados indicam se vírus ou malwares foram detectados.

## Funcionalidades

- **Envio automatizado de arquivos**: A POC envia automaticamente um arquivo ao VirusTotal utilizando a API de escaneamento de arquivos.
- **Verificação periódica de status**: O status do escaneamento é verificado a cada 30 segundos até que a análise seja finalizada.
- **Medição de tempo**: O tempo total gasto para analisar o arquivo é calculado e exibido em um formato legível (minutos e segundos).
- **Resultado de detecção**: O resultado do escaneamento é exibido, mostrando o número de detecções (se houver) e informações detalhadas de diferentes motores antivírus.

## Requisitos

- Node.js instalado (versão 14 ou superior)
- Chave de API do VirusTotal (Você pode obter uma chave ao se inscrever no [VirusTotal](https://www.virustotal.com/))

## Instalação

1. Clone o repositório ou baixe o código:
   ```bash
   git clone https://github.com/stellaoliveirabertt/poc-virustotal.git
   ```

2. Navegue até o diretório do projeto:
   ```bash
   cd poc-virustotal
   ```

3. Instale as dependências:
   ```bash
   npm install
   ```

## Configuração

1. Obtenha uma chave de API do VirusTotal e substitua `YOUR_API_KEY` no código pela sua chave.

2. Substitua o caminho do arquivo (`filePath`) pelo caminho do arquivo que você deseja escanear.

## Como Executar

Para executar o script e automatizar o envio e a verificação do status de escaneamento, use o comando abaixo:

```bash
node nome_do_arquivo.js
```

O script:
- Enviará o arquivo para o VirusTotal.
- Verificará o status da análise a cada 30 segundos.
- Exibirá o tempo total gasto para concluir o escaneamento e mostrará o resultado das detecções.

## Exemplo de Saída

```bash
Arquivo enviado. scan_id: 2d84be5e393cd85d15bd1530df50fe18e8c0768a669fd855d9b8df5c32d789aa
Análise ainda não concluída. Tentando novamente em 30 segundos...
Análise ainda não concluída. Tentando novamente em 30 segundos...
Análise concluída! Detecções: 0
Processo de verificação concluído! Tempo total: 2 minutos e 45 segundos
```

## Observações

- O tempo de análise pode variar dependendo do tamanho do arquivo e da carga no sistema do VirusTotal.
- A API do VirusTotal possui limites de requisições por minuto. Se você estiver utilizando a versão gratuita, faça as requisições com moderação.

## Licença

Este projeto é licenciado sob a [MIT License](LICENSE).
