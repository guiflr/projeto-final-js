module.exports = app => {
    app.route('/users')
        .post(app.api.user.save)
        .get(app.api.user.get)
    app.route('/users/:id')
        .put(app.api.user.save)    
        .get(app.api.user.getById)

    app.route('/categories')
        .get(app.api.categories.get)
        .post(app.api.categories.save)

    app.route('/categories/tree')
    .get(app.api.categories.getTree)
    app.route('/categories/:id')        
        .get(app.api.categories.getById)
        .put(app.api.categories.save)
        .delete(app.api.categories.remove)

    app.route('/articles')
        .get(app.api.article.get)
        .post(app.api.article.save)
    app.route('/articles/:id')
        .get(app.api.article.getById)
        .put(app.api.article.save)
        .delete(app.api.article.remove)

    app.route('/categories/:id/articles')
        .get(app.api.article.getByCategory)
}