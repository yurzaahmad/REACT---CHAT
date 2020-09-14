import React from 'react'
import TodoForm from './TodoForm'
import TodoList from './TodoList'
import axios from 'axios'
import io from 'socket.io-client'
import moment from 'moment'

var socket = io.connect('http://localhost:3001/')

const request = axios.create({
    baseURL: 'http://localhost:3001/api/',
    timeout: 1000,
    headers: { 'token': 'asfasfgergrhrh' }
});

export default class TodoBox extends React.Component {
    constructor(props) {
        super(props)
        this.state = { data: [] }
        this.addTodo = this.addTodo.bind(this)
        this.removeTodo = this.removeTodo.bind(this)
        this.resendTodo = this.resendTodo.bind(this)
    }

    componentDidMount() {
        this.loadChat()

        const time = moment().format('h:mm a')
        socket.on('chats', function (data) {
            console.log('DID MOUNT', data)
            this.setState((state, props) => (
                {
                    data: [...state.data, { ...data, time, sent: true }]
                }))
        }.bind(this))

        socket.on('delete-chat-frontend', function (id) {
            console.log('delete din MOUNT', id)
            this.setState((state, props) =>
                console.log('STATE', state)
                    ({
                        data: state.data.filter(item => {
                            return item.id !== id.id
                        })
                    }))
        }.bind(this))
    }

    loadChat() {
        request.get('chats').then(data => {
            const completeData = data.data.map(item => {
                item.sent = true;
                return item
            })
            console.log('complete data', completeData);
            this.setState({ data: data.data })
        }).catch(err => {
            console.log('error komponent', err);
        })
    }

    addTodo(name, message) {
        const id = Date.now()
        const time = moment().format('h:mm a')

        this.setState((state, props) => ({
            data: [...state.data, { id, name, message, time, sent: true }]
        }))

        socket.emit('chat', {
            id,
            name,
            message
        })

        request.post('chats', {
            id, name, message
        }).then(data => {
            console.log(data);
        }).catch(err => {
            console.log('err add', err);
            this.setState((state, props) => ({
                data: state.data.map(item => {
                    if (item.id === id) {
                        item.sent = false;
                    }
                    return item;
                })
            }))
        })
    }

    removeTodo(id) {
        console.log('hapus');
        this.setState((state, props) => ({
            data: state.data.filter(item => item.id !== id)
        }));
        socket.emit('delete backend', {
            id
        })

        request.delete(`chats/${id}`).then(data => {
            console.log(data)
        }).catch(err => {
            console.log(err)
        })
    }

    resendTodo(id, name, message) {
        request.post('chats', {
            id,
            name,
            message
        }).then(data => {
            this.setState((state, props) => ({
                data: state.data.map(item => {
                    if (item.id === id) {
                        item.sent = true;
                    }
                    return item;
                })
            }));
        }).catch(err => {
            console.log(err)
        })
    }



    render() {
        return (
            < div className="container">
                <div className="row mt-5">
                    <div className="col-md-6 offset-md-3 col-sm-6 offset-sm-3 col-12 comments-main pt-4 rounded">
                        <TodoList data={this.state.data} remove={this.removeTodo} resend={this.resendTodo} />
                        <TodoForm add={this.addTodo} />
                    </div >
                </div>
            </div>
        )
    }
}