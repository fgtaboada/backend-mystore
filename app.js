
let express = require( 'express' )
const database = require('./database')


const app = express()
const port = 3000

const routerItems = require('./routers/routerItems')
app.use('/items', routerItems)


app.listen( port, () => {
    console.log( 'App listening on port ' + port )
})