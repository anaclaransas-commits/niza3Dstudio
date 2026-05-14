# Deploy no Netlify - 3DPrint Master Manager

## Pré-requisitos
- Conta no Netlify
- Repositório no GitHub/GitLab/Bitbucket
- Node.js 20 (recomendado)

## Configuração já aplicada no projeto
- Arquivo `netlify.toml` criado
- Build command: `npm run build`
- Publish directory: `dist`
- Redirect SPA (`/* -> /index.html`)

## Passo a passo (via painel Netlify)
1. Acesse o Netlify e clique em **Add new site**.
2. Escolha **Import an existing project**.
3. Conecte seu repositório.
4. Confirme as opções de build (já vem do `netlify.toml`).
5. Clique em **Deploy site**.

## Após publicar
- Teste navegação em todas as páginas (Dashboard, Calculadora, Produtos, etc.).
- Faça um hard refresh para garantir carregamento dos assets novos.
- Valide criação/edição de dados no navegador.

## Observações importantes (estado atual do app)
- Os dados ainda ficam em `localStorage` (por navegador/dispositivo).
- Para multiusuário e persistência real, será preciso backend + banco + storage.

## Próxima etapa recomendada
- Migrar dados para backend (ex.: Supabase) mantendo frontend no Netlify.
