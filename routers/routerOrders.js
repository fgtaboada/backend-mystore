
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


routerOrders.get('/:id/items', async (req, res) => {
    if ( req.params.id == undefined ){
        return res.status(400).json( { error : 'no id param' } )
    }
    
    
    database.connect();
    
    let ordersItems = await database.query(
        'SELECT * FROM orders_items \
            JOIN items ON orders_items.idItem = items.id \
            WHERE orders_items.idOrder = ?', [req.params.id] )
    database.disconnect()
    res.json(ordersItems)
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

routerOrders.put( '/:idOrder/items/:idItem', async (req,res) => {
    // update number of units
    // http://localhost:3000/orders/4/items/5
    let idOrder = req.params.idOrder
    if ( idOrder == undefined){
        res.status(400).json({error:"no idOrder in params"})
    }
    idOrder = parseInt(idOrder)
    
    let idItem = req.params.idItem
    if (idItem == undefined) {
        res.status(400).json({ error: "no idItem in params" })
    }
    idItem = parseInt(idItem)

    let units = req.body.units
    if (units == undefined) {
        res.status(400).json({ error: "no units in body" })
    }
    units = parseInt( units )

    database.connect();
    await database.query( 'UPDATE orders_items SET units = ? WHERE idOrder = ? AND idItem = ?', 
        [units,idOrder,idItem] )
    database.disconnect();
    res.json({ modified : true})
})


routerOrders.put( '/:id', async (req,res) => {
    // modify status
    let idOrder = req.params.id
    if (idOrder == undefined) {
        return res.status(400).json({ error: 'no idOrder' })
    }
    idOrder = parseInt(idOrder)

    let status = req.body.status
    if (status == undefined) {
        return res.status(400).json({ error: 'no status in body' })
    }
    status = parseInt( status )

    database.connect();
    // let updatedStatus = 
    await database.query( 'UPDATE orders SET status = ? WHERE id = ?', 
        [status, idOrder] )
    database.disconnect();
    res.json({ updatedStatus : true })
})


routerOrders.delete('/:id', async (req, res) => {
    let idOrder = req.params.id
    if (idOrder == undefined) {
        return res.status(400).json({ error: 'no idOrder in params' })
    }

    database.connect();
    try {
        await database.query('DELETE FROM orders_items WHERE idOrder = ?', [idOrder])
        await database.query('DELETE FROM orders WHERE id = ?', [idOrder])
    } catch (error) {
        // return res.status(400).json({error:error})
        return res.status(400).json({ error: 'Unable to DELETE order with active/previous orders' })
    }
    database.disconnect()
    res.json({ delete: true })
})

module.exports = routerOrders