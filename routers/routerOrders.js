
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

routerOrders.post( '/:idOrder/', async (req,res) => {
    let idOrder = req.params.idOrder
    
    if ( idOrder == undefined ) {
        return res.status(400).json({ error: 'no idOrder'})
    }
    
    let idItem = req.body.idItem
    if (idItem == undefined) {
        return res.status(400).json({ error: 'no idItem in body' })
    }

    let units = req.body.units
    if ( units == undefined ) {
        return res.status(400).json({ error: 'no units in body' })
    }
    units = parseInt(units)

    database.connect();
    let itemsInOrder = await database.query( 'SELECT * FROM orders_items WHERE idOrder = ? AND idItem = ?',
        [idOrder, idItem])
    if( itemsInOrder.length > 0 ) {
        // idItem already ordered -> increase one unit
        return res.status(400).json({ error : "item already in the shopping bag"})
    }
    let orderItem = await database.query( 'INSERT INTO orders_items (idOrder,idItem,units) VALUES (?,?,?)', 
        [idOrder,idItem,units] )
    database.disconnect();
    res.json({ inserted : true })
})

module.exports = routerOrders