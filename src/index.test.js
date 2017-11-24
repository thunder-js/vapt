import { createStore, applyMiddleware } from 'redux'
import { createMiddleware } from './index'

const rootReducer = (state = {}, action) => {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        message: 'start',
      }
    case 'FETCH_SUCCESS':
      return {
        ...state,
        message: 'success',
        data: action.payload,
      }
    case 'FETCH_ERROR':
      return {
        ...state,
        message: 'error',
        error: action.error,
      }
    default:
      return state
  }
}


const FETCH = 'FETCH'

const promise = () => new Promise((resolve) => {
  resolve('rafael')
})

const promiseError = () => new Promise(() => {
  throw new Error('my-error')
})

const fetch = () => ({
  type: FETCH,
  payload: promise(),
})
const fetchError = () => ({
  type: FETCH,
  payload: promiseError(),
})

const config = {
  startTypeGetter: action => `${action.type}_START`,
  successTypeGetter: action => `${action.type}_SUCCESS`,
  errorTypeGetter: action => `${action.type}_ERROR`,
}
describe('middleware', () => {
  it('works for resolving promises', async () => {
    const store = createStore(rootReducer, applyMiddleware(createMiddleware(config)))
    store.dispatch(fetch())
      .then((data) => {
        expect(data).toEqual('rafael')
        const state = store.getState()
        expect(state).toEqual({
          message: 'success',
          data: 'rafael',
        })
      })
    const state = store.getState()

    expect(state).toEqual({
      message: 'start',
    })
  })

  it('works for failing promises', async () => {
    const store = createStore(rootReducer, applyMiddleware(createMiddleware(config)))
    store.dispatch(fetchError())
      .then(() => {
        // if this code gets executed, something is wrong :(
        expect(true).toEqual(false)
      })
      .catch((returnedError) => {
        expect(returnedError.message).toBe('my-error')
        const state = store.getState()
        const { error, message } = state
        expect(message).toBe('error')
        expect(error.message).toBe('my-error')
      })
    const state = store.getState()
    expect(state).toEqual({
      message: 'start',
    })
  })
})
