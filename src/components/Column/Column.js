import React, { useEffect, useRef, useState } from 'react'
import { Container, Draggable } from 'react-smooth-dnd'
import { Dropdown, Form, Button } from 'react-bootstrap'
import { cloneDeep } from 'lodash'

import './Column.scss'
import Card from 'components/Card/Card'
import ConfirmModal from 'components/Common/ConfirmModal'
import { mapOrder } from 'utilities/sorts'
import { MODAL_ACTION_CONFIRM } from 'utilities/constants'
import { saveContentAfterPressEnter, selectAllInlineText } from 'utilities/contentEditAble'

function Column(props) {
  const { column, onCardDrop, onUpdateColumn } = props
  const cards = mapOrder(column.cards, column.cardOrder, 'id')

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const toggleShowModal = () => setShowConfirmModal(!showConfirmModal)

  const [columnTitle, setNewColumnTitle ] = useState('')
  const handleColumnTitleChange =(e) => setNewColumnTitle(e.target.value)

  const [openNewCardForm, setOpenNewCardForm] = useState(false)
  const toggleOnNewCardForm = () => setOpenNewCardForm(!openNewCardForm)

  const newCardTextAreaRef = useRef(null)

  const [newCardTitle, setNewCardTitle] = useState('')
  const onNewCardTitleChange = (e) => setNewCardTitle(e.target.value)

  useEffect(() => {
    setNewColumnTitle(column.title)
  }, [column.title])

  useEffect(() => {
    if (newCardTextAreaRef && newCardTextAreaRef.current) {
      newCardTextAreaRef.current.focus()
      newCardTextAreaRef.current.select()
    }
  }, [openNewCardForm])

  const handleColumnTitleBlur = () => {
    const newColumn = {
      ...column,
      title: columnTitle
    }
    onUpdateColumn(newColumn)
  }

  const onConfirmModalAction = (type) => {
    if (type === MODAL_ACTION_CONFIRM) {
      const newColumn = {
        ...column,
        _destroy: true
      }
      onUpdateColumn(newColumn)
    }
    toggleShowModal()
  }
  const addNewCard = () => {
    if (!newCardTitle) {
      newCardTextAreaRef.current.focus()
      return
    }
    const newCardToAdd = {
      id: Math.random().toString(36).substring(2, 7),
      boardId: column.boardId,
      columnId: column.id,
      title: newCardTitle.trim(),
      cover:null
    }

    let newColumn = cloneDeep(column)
    newColumn.cards.push(newCardToAdd)
    newColumn.cardOrder.push(newCardToAdd.id)
    onUpdateColumn(newColumn)
    setNewCardTitle('')
    toggleOnNewCardForm()
  }

  return (
    <div className="column">
      <header className='column-drag-handle'>
        <div className='column-title'>
          <Form.Control
            size= "sm"
            type="text"
            className='g2task-content-editable'
            value={columnTitle}
            onChange={handleColumnTitleChange}
            onBlur= {handleColumnTitleBlur}
            onKeyDown={saveContentAfterPressEnter}
            onClick={selectAllInlineText}
            onMouseDown={e => e.preventDefault()}
            spellCheck= "false"
          />
        </div>
        <div className='column-dropdown-actions'>
          <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-basic" size='sm' className='dropdown-btn'/>
            <Dropdown.Menu>
              <Dropdown.Item >Add card...</Dropdown.Item>
              <Dropdown.Item onClick={toggleShowModal}>Remove column...</Dropdown.Item>
              <Dropdown.Item >Move all cards...</Dropdown.Item>
              <Dropdown.Item >Move all cards...</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </header>
      <div className="card-list">
        <Container
          orientation="vertical"
          groupName="column"
          onDrop={dropResult => onCardDrop(column.id, dropResult)}
          getChildPayload={index => cards[index]}
          dragClass='card-ghost'
          dropClass='card-ghost-drop'
          dropPlaceholder={{
            animationDuration: 150,
            showOnTop: true,
            className: 'card=drop-preview'
          }}
          dropPlaceholderAnimationDuration={200}
        >
          {cards.map((card, index) => (
            <Draggable key={index}>
              <Card card={card} />
            </Draggable>
          ))}
        </Container>
        {openNewCardForm &&
        <div className='add-new-card-area'>
          <Form.Control
            size= "sm"
            as="textarea"
            rows="3"
            placeholder="Enter a title for thís card..."
            className='textarea-enter-new-card'
            ref= {newCardTextAreaRef}
            value={newCardTitle}
            onChange={onNewCardTitleChange}
            onKeyDown={event => (event.key === 'Enter') && addNewCard()}
          />
        </div>
        }
      </div>
      <footer>
        {openNewCardForm &&
        <div className='add-new-card-actions'>
          <Button variant='success' size="sm" onClick={addNewCard}> Add card</Button>
          <span className='cancel-icon' onClick={toggleOnNewCardForm}>
            <i className='fa fa-times icon'></i>
          </span>
        </div>
        }
        {! openNewCardForm &&
        <div className="footer-actions" onClick={toggleOnNewCardForm}>
          <i className='fa fa-plus icon'/>
          Add another card
        </div>
        }
      </footer>
      <ConfirmModal
        show={showConfirmModal}
        onAction={onConfirmModalAction}
        title="Remove column"
        content= {`Are you sure you want to remove <strong>${column.title}! </Strong>`}
      />
    </div>
  )
}
export default Column
