# 

1\. Entidades principais inferidas

Utilizador

Representa cada estudante&#x2F;participante\.

**User**

- user\_id \(PK\)
- nome
- email
- curso
- ano
- bio
- nivel
- pontos
- data\_registo
- foto\_perfil

Relacionamentos:

- cria posts
- publica materiais
- cria tópicos
- comenta
- dá likes
- participa em grupos

Material de aprendizagem

Conteúdos partilhados \(docs, vídeos, resumos\)\.

**Material**

- material\_id \(PK\)
- titulo
- descricao
- tipo \(doc, video, link\)
- data\_publicacao
- visualizacoes
- autor\_id \(FK\)

Relacionamentos:

- pertence a uma área&#x2F;disciplina
- pode receber comentários
- pode receber likes

Área &#x2F; Disciplina

Categorias como informática, matemática, gestão\.

**Area**

- area\_id \(PK\)
- nome
- descricao

Relacionamentos:

- contém materiais
- contém tópicos de fórum
- pode estar associada a grupos

Fórum

Tópico

**Topic**

- topic\_id \(PK\)
- titulo
- descricao
- data\_criacao
- criador\_id \(FK\)
- area\_id \(FK\)

Post &#x2F; resposta

**Post**

- post\_id \(PK\)
- conteudo
- data\_post
- autor\_id \(FK\)
- topic\_id \(FK\)

Comentários

Para materiais ou posts\.

**Comment**

- comment\_id \(PK\)
- conteudo
- data
- autor\_id \(FK\)
- material\_id \(FK, nullable\)
- post\_id \(FK, nullable\)

Likes

**Like**

- like\_id \(PK\)
- user\_id \(FK\)
- material\_id \(FK, nullable\)
- post\_id \(FK, nullable\)
- comment\_id \(FK, nullable\)

2\. Sistema de Grupos de Estudo

Grupo

Exemplo no interface:<br> &quot;Algoritmos e Estruturas – 24&#x2F;30 membros – Sala B204&quot;

**Group**

- group\_id \(PK\)
- nome
- descricao
- area\_id \(FK\)
- criador\_id \(FK\)
- limite\_membros
- local
- horario

Membership

Relação muitos\-para\-muitos\.

**GroupMember**

- group\_id \(FK\)
- user\_id \(FK\)
- role \(membro&#x2F;admin\)
- data\_entrada

PK composta:

- \(group\_id, user\_id\)

&lt;

