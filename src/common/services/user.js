import uuid from 'uuid/v4'

import * as config from '../utils/config'
import * as gitService from './git'
import * as sshService from './ssh'

export const get = () => {
  return config.read().users || []
}

const persist = users => {
  config.write({ users })
}

const updateExternalServices = users => {
  gitService.updateAuthorAndCoAuthors(users)
  sshService.rotateIdentityFile(users[0].rsaKeyPath)
}

export const getId = () => uuid().substring(0, 8)

export const add = ({ name, email, rsaKeyPath }) => {
  const users = get()
  const id = getId()
  users.push({ id, name, email, rsaKeyPath, active: true })

  persist(users)
  updateExternalServices(users)

  return users
}

export const update = user => {
  const users = get()
  const foundIndex = users.findIndex(u => u.id === user.id)
  if (foundIndex !== -1) {
    users[foundIndex] = user
  } else {
    users.push(user)
  }

  persist(users)
  updateExternalServices(users)

  return users
}

export const remove = id => {
  const users = get()
  const foundIndex = users.findIndex(u => u.id === id)
  if (foundIndex === -1) return

  users.splice(foundIndex, 1)

  persist(users)
  updateExternalServices(users)

  return users
}

export const rotate = () => {
  const users = get()
  const activeUsers = users.filter(u => u.active)
  if (!activeUsers.length || activeUsers.length === 1) return users

  const inactiveUsers = users.filter(u => !u.active)
  const updatedUsers = [
    ...activeUsers.slice(1),
    activeUsers[0],
    ...inactiveUsers
  ]

  persist(updatedUsers)
  updateExternalServices(updatedUsers)

  return updatedUsers
}

export const toggleActive = id => {
  const users = get()
  const user = users.find(u => u.id === id)
  if (!user) return users

  const activeUsers = users.filter(u => u.active && u.id !== id)
  const inactiveUsers = users.filter(u => !u.active && u.id !== id)

  user.active = !user.active
  const updatedUsers = [
    ...activeUsers,
    user,
    ...inactiveUsers
  ]

  persist(updatedUsers)
  updateExternalServices(updatedUsers)

  return updatedUsers
}

// TODO: Delete this after a reasonable amount of time has passed
// to ensure that ids generated by earlier versions of the app are
// shorter for more usability in the cli
export const shortenUserIds = () => {
  let users = get()
  users = users.map(u =>
    u.id.length === 8
      ? u
      : { ...u, id: getId() })

  persist(users)
}
