import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'

import './home.css'

const Home = ({match}) => {
    
    let backend = 'https://ntnui-basket-tryouts.jakoblj.xyz'
    
    const [data, setData] = useState(null)
    const [error, setError] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [event, setEvent] = useState(null)
    const [registered, setRegistered] = useState(false)
    const [regData, setRegData] = useState(null)

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')

    const attend = () => {
        fetch(`${backend}/api/attend/${event}/`, {method: 'POST', headers: {'Content-Type': 'Application/JSON'}, body: JSON.stringify({name, email, phone, timeId: event})}).then(r => r.json()).then(r => {
            setModalVisible(false)
            if (r.error) {
                setError(true)
            } else {
                setRegData(r)
                setRegistered(true)
            }
        })
    }

    const join = (event) => {
        setModalVisible(true)
        setEvent(event)
    }
    
    useEffect(() => {
        try {
            let teamId = window.location.href.split('?')[1].split('=')[1]        
            if (teamId === undefined) {
                throw 'Undefined team'
            }
            fetch(`${backend}/api/team/${teamId}/`).then(r => r.json()).then(r => {
                if (r.error) {
                    setError(true)
                } else {
                    setData(r)
                }
            }).catch(err => {
                console.log(err)
                setError(true)
            })

        } catch (e) {
            console.log(e)
            setError(true)
        }
    }, [])
    
    

    let avpos = undefined

    if (data !== null) {
        avpos = data.map(d => {
            return <div className={'cont'} key={d.date + d.time}>
                <h5>{d.name}</h5>
                <p>
                    {d.date}: {d.time}
                </p>
                <p>Ledige plasser: {d.count}</p>
                
                <div>
                    <button onClick={() => join(d.id)}>Meld på</button>
                </div>
            </div>
        })
    }

    if (modalVisible && event) {
        return <div>
                <div>
                    <button onClick={() => {setModalVisible(false)}}>Tilbake</button>
                </div>
                <div className={'wrapper'}>
                    <h2>Nesten ferdig, vi trenger bare litt mer informasjon!</h2>
                    <div>
                        <input type={'text'} value={name} onChange={(e) => setName(e.target.value)} placeholder={'Name'} />
                    </div>
                    <div>
                        <input type={'email'} value={email} onChange={(e) => setEmail(e.target.value)} placeholder={'Email'} />
                    </div>
                    <div>
                        <input type={'text'} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={'Phone'} />
                    </div>
                    <div>
                        <button onClick={attend}>Meld på</button>
                    </div>
                    <p>Dataen vil bli slettet etter tryouts</p>
                </div>
        </div>
        
    }

    if (registered) {
        
        return <div className={'wrapper'}>
            <h2>Du er nå påmeldt</h2>
            <p>{regData.email} at {regData.date} kl. {regData.time}</p>
        </div>
    }

    return <div>
        
        <div className="wrapper">
        <h1>Velkommen til tryouts med NTNUI Basket</h1>

    </div>

    {error && <div className="wrapper" id="error">
        <h2>Det skjedde en feil? Kan du sende en mail til <a href="mailto: jakob.johannessen@ntnui.no">jakob.johannessen@ntnui.no</a> </h2>
    </div>}

    {data === null &! error ?
    <div className="wrapper" id="content">
        <p>Vi tar deg straks til siden hvor du kan velge når du vil på tryouts!</p>
        <p>Loading...</p>
    </div> : null}

    {data !== undefined &! error ?
    <div className='wrapper'>
        <h3 style={{margin: '1em'}}>Velg tid for tryouts</h3>
        <div className={'midwrap'}>
            {avpos}
        </div>
    </div> : null}

    <div className="wrapper">
        <p>Made in a rush by <a href="https://ntnui.no/basket">NTNUI Basket</a></p>

    </div>
    </div>
}

export default Home