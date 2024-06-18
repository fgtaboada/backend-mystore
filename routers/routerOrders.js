
let express = require( 'express' )

const database = require('./../database')

let routerOrders = express.Router()

routerOrders.get( '/', async (req, res) => {
    database.connect();
    let orders = []
    if ( req.query.DNIClient != undefined ){
        orders = await database.query( 'SELECT * FROM orders WHERE DNIClient = ?', [req.query.DNIClient] )
    } else {
        orders = await database.query( 'SELECT * FROM orders' )
    }

    database.disconnect()
    res.send( orders )
})

routerOrders.get('/:id', async (req, res) => {
    if ( req.params.id == undefined ){
        return res.status(400).json( { error : 'no id param' } )
    }

    database.connect();
    let orders = await database.query('SELECT * FROM orders WHERE id = ?', [req.params.id] )
    database.disconnect()
    res.json(orders)
})

routerOrders.post( '/', async (req, res) => {
    let DNIClient = req.body.DNIClient

    if (DNIClient == undefined ){
        return res.status(400).json({error: "no DNIClient in body"})
    }
    
    database.connect();
    let insertedOrder = await database.query('INSERT INTO orders (DNIClient, status) VALUES (?,0)', [req.params.DNIClient])
    database.disconnect()
    res.json({ inserted: insertedOrder })
})

module.exports = routerOrders