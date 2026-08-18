import { useCallback } from 'react'
import { IconStar, IconStarFilled } from './Icons'
import { Spinner } from './Spinner'
import { useFavorites, useAddFavorite, useRemoveFavorite } from '../../hooks/useFavorites'
import type { FavoriteCreate } from '../../api/types'

interface FavoriteButtonProps {
  targetType: FavoriteCreate['target_type']
  targetId: string
  size?: 'sm' | 'md'
}

export function FavoriteButton({ targetType, targetId, size = 'md' }: FavoriteButtonProps) {
  const { data: favoritesData } = useFavorites({ size: 100 })
  const addFavorite = useAddFavorite()
  const removeFavorite = useRemoveFavorite()

  const favorites = favoritesData?.items || []
  const isFavorited = favorites.some((f) => f.target_type === targetType && f.target_id === targetId)
  const sizeClasses = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
  const buttonClasses = size === 'sm' ? 'p-1' : 'p-1.5'

  const toggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (addFavorite.isPending || removeFavorite.isPending) return
    if (isFavorited) {
      removeFavorite.mutate({ targetType, targetId })
    } else {
      addFavorite.mutate({ target_type: targetType, target_id: targetId })
    }
  }, [isFavorited, targetType, targetId, addFavorite, removeFavorite])

  if (addFavorite.isPending || removeFavorite.isPending) {
    return <Spinner size="sm" />
  }

  return (
    <button onClick={toggle} className={`${buttonClasses} rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors`} title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}>
      {isFavorited ? <IconStarFilled className={`${sizeClasses} text-yellow-500`} /> : <IconStar className={`${sizeClasses} text-surface-400`} />}
    </button>
  )
}
