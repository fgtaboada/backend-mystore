
let express = require( 'express' )

const database = require('./../database')

let routerClients = express.Router()

routerClients.get( '/', async (req, res) => {
    database.connect();
    let clients = []
    if (req.query.p != undefined && !isNaN(req.query.p)) {
        let page = parseInt(req.query.p)
        let elementsperpage = 2
        page = (page - 1) * elementsperpage
        clients = await database.query('SELECT * FROM clients OFFSET ? ROWS FETCH NEXT ? ROWS ONLY', [page, elementsperpage])
    } else {
        clients = await database.query('SELECT * FROM clients')
    }

    database.disconnect()
    res.json(clients)
})


routerClients.delete( '/:DNI', async (req, res) => {
    let DNIClient = req.params.DNI
    if ( DNIClient == undefined ){
        return res.status(400).json({error: 'no DNIClient in params'})
    }

    database.connect();
    try{
        let clientOrders = await database.query( 'SELECT id FROM orders WHERE DNIClient = ?', [DNIClient] )
        if (clientOrders.length > 0){
            // simplify to retain just order ids
            clientOrders = clientOrders.map( order => order.id )
            await database.query('DELETE FROM orders_items WHERE idOrder IN (?)', [clientOrders])
            await database.query('DELETE FROM orders WHERE DNIClient = ?', [DNIClient])
        }
        await database.query( 'DELETE FROM clients WHERE DNI = ?', [DNIClient] )
    } catch(error) {
        // return res.status(400).json({error:error})
        return res.status(400).json({ error: 'Unable to DELETE client with active/previous orders' })
    }
    database.disconnect()
    res.json({ delete: true })
})

module.exports = routerClients