import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import type { FC } from 'react'
import React, { useMemo, useState } from 'react'
import type { InjectedIntlProps } from 'react-intl'
import { injectIntl } from 'react-intl'
import Skeleton from 'react-loading-skeleton'
import { useCssHandles } from 'vtex.css-handles'

import { megaMenuState } from '../State'
import type { ItemProps } from './Item'
import Item from './Item'
import Submenu from './Submenu'

const CSS_HANDLES = [
  'menuContainerVertical',
  'departmentsContainer',
  'menuContainerNavVertical',
  'menuItemVertical',
  'submenuContainerVertical',
  'departmentsTitle',
  'level1Title',
  "collapsibleHeaderText",
  "allThisCategory"
] as const

const VerticalMenu: FC<VerticalMenuProps> = observer((props) => {
  const { handles } = useCssHandles(CSS_HANDLES)
  const { departments, setDepartmentActive } = megaMenuState
  const { openOnly, orientation } = props

  const [openDepartmentId, setOpenDepartmentId] = useState<string | null>(null)

  const departmentItems = useMemo(() => departments.map((d, i) => {
    const hasCategories = !!d.menu?.length

    const toggleDepartment = () => {
      if (hasCategories) {
        const isSameDepartment = openDepartmentId === d.id

        if (isSameDepartment) {
          // Fecha tudo
          setOpenDepartmentId(null)
          setDepartmentActive(null)
        } else {
          // Abre o submenu clicado
          setOpenDepartmentId(d.id)
          setDepartmentActive(d)
        }
      }
    }


    const isOpen = openDepartmentId === d.id

    const itemProps: ItemProps = {
      id: d.id,
      iconId: d.icon,
      accordion: hasCategories,
      tabIndex: i,
      onClick: toggleDepartment,
      style: d.styles,
      enableStyle: d.enableSty,
      ...(!hasCategories && { to: d.slug }),
    }

    const generateUrlLink = (origin: string, slug: string): string => {
      let url = `${origin}/${slug}`;

      const parts = url.split('https://');

      if (parts && parts[1].includes("//")) {
        url = parts[0] + 'https://' + parts[1].replace("//", "/");
      }

      return url;
    }

    return (
      <li className={classNames(handles.menuItemVertical, 'bb b--light-gray', { bt: i === 0 })} key={d.id}>
        <Item className={classNames('pv5 mh5')} {...itemProps}>
          <span className={handles.level1Title}>{d.name}</span>

          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="3" viewBox="0 0 12 3" fill="none">
              <path d="M0.5 2.25V0.75H11.5V2.25H0.5Z" fill="#A8A8A8" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="13" viewBox="0 0 14 13" fill="none">
              <path d="M6.25 7.25H0.5V5.75H6.25V0H7.75V5.75H13.5V7.25H7.75V13H6.25V7.25Z" fill="#A8A8A8" />
            </svg>
          )}
        </Item>
        {isOpen && hasCategories && (
          <div className={classNames(handles.submenuContainerVertical, 'bg-base w-100')}>
            <a href={generateUrlLink(window.location.origin, d.slug)} className={`${handles.allThisCategory}`}>Tudo em {d.name}</a>
            <Submenu openOnly={openOnly} />
          </div>
        )}
      </li>
    )
  }
  ), [departments, openDepartmentId])

  return orientation === "vertical" ? (
    <nav className={classNames(handles.menuContainerNavVertical, 'w-100')}>
      <div className={handles.departmentsContainer}>
        <ul className={classNames(handles.menuContainerVertical, 'list pa0')}>
          {departments.length ? (
            departmentItems
          ) : (
            <div className="flex flex-column justify-center ph5 lh-copy">
              <Skeleton count={4} height={40} />
            </div>
          )}
        </ul>
      </div>
    </nav>
  ) : null
})

type VerticalMenuProps = InjectedIntlProps & {
  openOnly: string
  orientation: string
}

export default injectIntl(VerticalMenu)
