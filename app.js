
let express = require( 'express' )
const database = require('./database')


const app = express()
const port = 3000

app.use(express.json())

const routerItems = require('./routers/routerItems')
app.use('/items', routerItems)

const routerOrders = require('./routers/routerOrders')
app.use('/orders', routerOrders)

const routerClients = require('./routers/routerClients')
app.use('/clients', routerClients)

app.listen( port, () => {
    console.log( 'App listening on port ' + port )
})