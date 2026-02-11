import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import type { FC } from 'react'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import type { InjectedIntlProps } from 'react-intl'
import { injectIntl } from 'react-intl'
import Skeleton from 'react-loading-skeleton'
import { useCssHandles } from 'vtex.css-handles'

import { megaMenuState } from '../State'
import styles from '../styles.css'
import Item from './Item'
import Submenu from './Submenu'
import { BUTTON_ID } from './TriggerButton'

const CSS_HANDLES = [
  'menuContainer',
  'menuContainerNav',
  'menuItem',
  'submenuContainer',
] as const

const HorizontalMenu: FC<
  InjectedIntlProps & {
    openOnly: string
    orientation: string
    urlImgCategory?: string
  }
> = observer((props) => {
  const { handles } = useCssHandles(CSS_HANDLES)
  const {
    departments,
    departmentActive,
    config: { defaultDepartmentActive },
    setDepartmentActive,
    openMenu,
  } = megaMenuState

  const { orientation } = props

  const departmentActiveHasCategories = !!departmentActive?.menu?.length
  const navRef = useRef<HTMLDivElement>(null)

  const handleClickOutside = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event: any) => {
      const isTriggerButton = event?.path?.find(
        (data: HTMLElement) => data.dataset?.id === BUTTON_ID
      )

      if (
        navRef.current &&
        !navRef.current.contains(event.target as Node) &&
        !isTriggerButton
      ) {
        openMenu(false)
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [openMenu]
  )

  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true)

    return () => {
      document.removeEventListener('click', handleClickOutside, true)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const defaultDepartment = departments.find(
      (x) =>
        x.name.toLowerCase().trim() ===
        defaultDepartmentActive?.toLowerCase().trim()
    )

    if (defaultDepartment) {
      setDepartmentActive(defaultDepartment)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultDepartmentActive])

  const departmentItems = useMemo(
    () =>
      departments
        .filter((j) => j.display)
        .map((d) => {
          const hasCategories = !!d.menu?.length

          return (
            <li
              className={handles.menuItem}
              key={d.id}
              onMouseEnter={() => {
                setDepartmentActive(d)
              }}
            >
              <Item
                id={d.id}
                to={d.slug}
                iconId={d.icon}
                accordion={hasCategories}
                style={d.styles}
                enableStyle={d.enableSty}
                closeMenu={openMenu}
              >
                {d.name}
              </Item>
            </li>
          )
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [departments, departmentActive]
  )

  const loaderBlocks = useMemo(() => {
    const blocks: JSX.Element[] = []

    for (let index = 1; index <= 4; index++) {
      blocks.push(
        <div className="lh-copy">
          <Skeleton height={10} />
        </div>
      )
    }

    return blocks
  }, [])

  return orientation === "horizontal" ? (
    <nav className={classNames(handles.menuContainerNav)} ref={navRef} onMouseLeave={() => { setDepartmentActive(null) }}>
      <ul className={styles.menuContainer}>
        {departments.length ? (departmentItems) : (<Skeleton count={3} height={30} />)}
      </ul>
      {departments.length ? (departmentActive && departmentActiveHasCategories && (
        <div className={styles.submenuContainer}>
          <Submenu closeMenu={() => false} urlImgCategory={departmentActive.imgCategory} />
        </div>
      )) : (
        <div className="w-100" style={{ overflow: 'auto' }}>
          <div className={classNames(styles.submenuList, 'mh4 mb5')}>
            {loaderBlocks}
          </div>
        </div>
      )}
    </nav>
  ) : null
})

export default injectIntl(HorizontalMenu)
