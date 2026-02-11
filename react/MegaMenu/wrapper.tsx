import React, { useEffect, useState } from 'react'
import { useQuery } from 'react-apollo'

import GET_MENUS from '../graphql/queries/getMenus.graphql'
import type { GlobalConfig, MenusResponse, Orientation } from '../shared'
import HorizontalMenu from './components/HorizontalMenu'
import VerticalMenu from './components/VerticalMenu'
import { megaMenuState } from './State'

const Wrapper: StorefrontFunctionComponent<MegaMenuProps> = (props) => {
  const { openOnly, urlImgCategory } = props
  const isMobile: boolean = openOnly === "vertical" ? true : false
  const { data } = useQuery<MenusResponse>(GET_MENUS, {
    fetchPolicy: 'no-cache',
    variables: { isMobile },
  })

  const [orientationMenu, setOrientationMenu] = useState('')

  const { setDepartments, setConfig } = megaMenuState

  const currentOrientation: Orientation = openOnly ? openOnly : "horizontal"

  useEffect(() => {
    // eslint-disable-next-line vtex/prefer-early-return
    if (data?.menus.length) {
      setConfig({ ...props, orientation: currentOrientation })
      setDepartments(data.menus)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  useEffect(() => {
    if (openOnly) {
      setOrientationMenu(openOnly)
    } else {
      setOrientationMenu('horizontal')
    }
  }, [openOnly])

  if (orientationMenu === 'vertical') {
    return (
      <VerticalMenu
        openOnly={openOnly ?? "vertical"}
        orientation={orientationMenu}
      />
    )
  }

  return (
    <HorizontalMenu
      openOnly={openOnly ?? 'horizontal'}
      orientation={orientationMenu}
      urlImgCategory={urlImgCategory}
    />
  )
}

Wrapper.defaultProps = {
  title: 'Departments',
}

Wrapper.displayName = 'MegaMenu'

export type MegaMenuProps = GlobalConfig

export default Wrapper
