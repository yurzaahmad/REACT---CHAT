import React from 'react'
import TodoItem from './TodoItem'

export default function TodoList(props) {
    const todos = props.data.map((item, index) =>
        <TodoItem
            key={item.id}
            id={item.id}
            name={item.name}
            message={item.message}
            sent={item.sent}
            index={index}
            time={item.time}
            resend={() => props.resend(item.id, item.name, item.message)}
            hapus={() => props.remove(item.id)} />)

    return (
        <ol>{todos}</ol>
    )
}