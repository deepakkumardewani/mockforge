import { Hono } from 'hono'
import usersRouter from './users'
import productsRouter from './products'
import postsRouter from './posts'
import commentsRouter from './comments'
import todosRouter from './todos'
import cartsRouter from './carts'
import messagesRouter from './messages'
import notificationsRouter from './notifications'
import quotesRouter from './quotes'
import recipesRouter from './recipes'
import countriesRouter from './countries'
import companiesRouter from './companies'
import stocksRouter from './stocks'
import eventsRouter from './events'
import customRouter from './custom'

const rest = new Hono()

rest.route('/users', usersRouter)
rest.route('/products', productsRouter)
rest.route('/posts', postsRouter)
rest.route('/comments', commentsRouter)
rest.route('/todos', todosRouter)
rest.route('/carts', cartsRouter)
rest.route('/messages', messagesRouter)
rest.route('/notifications', notificationsRouter)
rest.route('/quotes', quotesRouter)
rest.route('/recipes', recipesRouter)
rest.route('/countries', countriesRouter)
rest.route('/companies', companiesRouter)
rest.route('/stocks', stocksRouter)
rest.route('/events', eventsRouter)
rest.route('/custom', customRouter)

export default rest
