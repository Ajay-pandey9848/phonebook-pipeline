import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Routes, Route, useParams } from 'react-router-dom'
import PokemonPage from './PokemonPage'

const App = () => {
  const [pokemonList, setPokemonList] = useState([])
  const [error, setError] = useState(false)

  useEffect(() => {
    axios
      .get('https://pokeapi.co/api/v2/pokemon/?limit=50')
      .then(res => setPokemonList(res.data.results))
      .catch(() => setError(true))
  }, [])

  if (error) {
    return <div data-testid="error">Error fetching data</div>
  }

  return (
    <Routes>
      <Route path="/" element={<div>Home page (list of Pokémon goes here)</div>} />
      <Route path="/pokemon/:name" element={<PokemonPageWrapper pokemonList={pokemonList} />} />
    </Routes>
  )
}

// Wrapper component to fetch individual Pokemon data
const PokemonPageWrapper = ({ pokemonList }) => {
  const { name } = useParams()
  const [pokemon, setPokemon] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoading(true)
    axios
      .get(`https://pokeapi.co/api/v2/pokemon/${name}`)
      .then(res => {
        // Transform the data to match what PokemonPage expects
        const transformedPokemon = {
          stats: res.data.stats.map(stat => ({
            name: stat.stat.name,
            value: stat.base_stat
          })),
          abilities: res.data.abilities.map(ability => ability.ability.name)
        }
        setPokemon(transformedPokemon)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [name])

  // Find previous and next Pokemon
  const currentIndex = pokemonList.findIndex(p => p.name === name)
  const previous = currentIndex > 0 ? pokemonList[currentIndex - 1].name : null
  const next = currentIndex < pokemonList.length - 1 ? pokemonList[currentIndex + 1].name : null

  if (loading) return <div>Loading...</div>
  if (error) return <div data-testid="error">Error fetching Pokemon data</div>
  if (!pokemon) return null

  return <PokemonPage pokemon={pokemon} previous={previous} next={next} />
}

export default App