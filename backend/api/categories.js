module.exports = app => {
    const {existsOrError} = app.api.validator

    const save = (req,res) => {
        const category = {...req.body}

        if(req.params.id) category.id = req.params.id

        try{
            existsOrError(category.name, 'Nome não informado')
        }catch(err){
            return res.status(400).send(err)
        }

        if(category.id){
            app.db('categories')
                .update(category)
                .where({id: category.id})
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        }else{
            app.db('categories')
                .insert(category)
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        }
    }

    const remove = async (req,res) => {
        try{
            existsOrError(req.params.id, 'Codigo da categoria não informado')

            const subcategory = await app.db('categories')
                .select('parentId')
                .where({parentId: req.params.id})                
            const article = await app.db('articles')
                .select('categoriesId')
                .where({categoriesId: req.params.id})            
                if(subcategory.length > 0 || article.length > 0){
                    throw 'Categoria possui subcategoria ou artigo'
                }

            const rowsDelete = await app.db('categories')
                .where({id: req.params.id}).del()
                if(rowsDelete.length < 0 || rowsDelete == ''){
                    throw 'Categoria não encontrada'
                }    
                res.status(204).send()

        }catch(err){
            res.status(400).send(err)
        }
    }

    const withParent = categories => {
        const getParent = (categories, parentId) => {
            const parent = categories.filter(parent => parent.id == parentId)
            return parent.length ? parent[0]:null
        }

        const categoriesWithPath = categories.map(category => {
            let path = category.name
            let parent = getParent(categories, category.parentId)
        
            while(parent){
                path = `${parent.name} > ${path}`
                parent = getParent(categories, parent.parentId)
            }

            return {...category, path}
        })

        categoriesWithPath.sort((a,b) => {
            if(a.path < b.path) return -1
            if(a.path > b.path) return 1
            return 0
        })

        return categoriesWithPath
    }

    const get = (req,res) => {
        app.db('categories')
            .then(categories => res.json(withParent(categories)))
            .catch(err => res.status(500).send(err))
    }

    const getById = (req,res) => {
        app.db('categories')
            .where({id: req.params.id})
            .first()
            .then(category => res.json(category))
            .catch(err => res.status(500).send(err))
    }

    const toTree = (categories, tree) => {
        if(!tree) tree = categories.filter(c => !c.parentId)
        tree = tree.map(parentNode => {
            const isChild = node => node.parentId == parentNode.id
            parentNode.children = toTree(categories, categories.filter(isChild))
            return parentNode
        })

        return tree
    }

    const getTree = (req,res) => {
        app.db('categories')
            .then(categories => res.json(toTree(categories)))
            .catch(err => res.status(500).send(err))
    }

    return {save,remove,get,getById, getTree}
}