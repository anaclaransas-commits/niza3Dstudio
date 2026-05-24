# Deploy no Netlify - Niza3D Studio Manager

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
- O front pode ser publicado estaticamente no Netlify.
- Para o catálogo compartilhado entre navegadores, use uma destas opções:
  - manter uma API ativa para `/api` e `/uploads`
  - configurar o Supabase no frontend para produtos, configurações e imagens
- Se o frontend e a API estiverem em hosts diferentes, configure `VITE_CATALOG_API_URL` para apontar para o servidor do catálogo.
- Sem API ou Supabase, os dados ficam apenas no `localStorage` do navegador atual.

## Próxima etapa recomendada
- Configurar o Supabase seguindo `SUPABASE_SETUP.md` ou manter um backend com storage persistente para catálogo e imagens.
