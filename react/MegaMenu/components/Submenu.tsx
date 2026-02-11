/* eslint-disable prettier/prettier */
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import type { FC } from 'react'
import React, { useMemo, useState } from 'react'
import type { InjectedIntlProps } from 'react-intl'
import { injectIntl } from 'react-intl'
import { useCssHandles } from 'vtex.css-handles'
import { ExtensionPoint } from 'vtex.render-runtime'

import type { MenuItem } from '../../shared'
import { megaMenuState } from '../State'
import styles from '../styles.css'
import Item, { ItemProps } from './Item'

const CSS_HANDLES = [
  'submenuContainer',
  'submenuList',
  'submenuListVertical',
  'submenuItem',
  'submenuItemVertical',
  'collapsibleContent',
  'collapsibleHeaderText',
  'seeAllLinkContainer',
  'seeAllLink',
  'submenuContainerTitle',
  'hideArrow',
] as const

export type ItemPropsSubmenu = InjectedIntlProps & {
  closeMenu?: (open: boolean) => void
  openOnly?: string
  urlImgCategory?: string
}

const Submenu: FC<ItemPropsSubmenu> = observer((props) => {
  const { closeMenu, openOnly, urlImgCategory } = props
  const { handles } = useCssHandles(CSS_HANDLES)
  const { departmentActive, config, getCategories } = megaMenuState
  const { orientation } = config

  const [openDepartmentId, setOpenDepartmentId] = useState<string | null>(null);

  const subCategories = (items: MenuItem[]) => {
    return items.filter((v) => v.display).map((x) => (
      <div key={x.id} className={handles.submenuItem}>
        <Item
          to={x.slug}
          iconId={x.icon}
          level={3}
          style={x.styles}
          enableStyle={x.enableSty}
          closeMenu={closeMenu}
        >
          {x.name}
        </Item>
      </div>
    ))
  }

  const items = useMemo(() => {
    if (!departmentActive) return

    const categories = getCategories()

    return categories.filter((j) => j.display).map((category, index) => {
      const hasCategories = !!category.menu?.length;
      const subcategories = category.menu?.length ? subCategories(category.menu) : []

      const setIsOpenCategory = () => {
        if (subcategories) {
          const isSameDepartment = openDepartmentId === category.id;

          if (isSameDepartment) {
            // Fecha tudo
            setOpenDepartmentId(null)
          } else {
            // Abre o submenu clicado
            setOpenDepartmentId(category.id)
          }
        }
      }

      const isOpen = openDepartmentId === category.id;
      const itemProps: ItemProps = {
        id: category.id,
        iconId: category.icon,
        accordion: hasCategories,
        tabIndex: index,
        onClick: setIsOpenCategory,
        style: category.styles,
        enableStyle: category.enableSty,
        ...(!hasCategories && { to: category.slug }),
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
        <div key={category.id} className={styles.submenuItem}>
          <div className={category.menu?.length ? '' : classNames(handles.hideArrow)}>
            {!!subcategories.length && orientation === "horizontal" ? (
              <>
                <a href={generateUrlLink(window.location.origin, category.slug)} className={handles.collapsibleHeaderText}>
                  {category.name}
                </a>

                <div className={handles.collapsibleContent}>
                  {subcategories}
                </div>
              </>
            ) : (
              <>
                <Item className={classNames('pv5 mh5')} {...itemProps}>
                  <span className={handles.collapsibleHeaderText}>{category.name}</span>

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
                {isOpen && (
                  <div className={handles.collapsibleContent}>
                    <Item
                      to={generateUrlLink(window.location.origin, category.slug)}
                      level={3}
                      closeMenu={closeMenu}
                    >
                      Tudo em {category.name}
                    </Item>
                    {subcategories}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )
    })
  }, [departmentActive, openDepartmentId])

  return (
    <>
      {departmentActive && (
        <>
          <div className={styles.submenuItems}>
            {orientation === 'horizontal' && openOnly === 'horizontal' ? (
              <>
                <ExtensionPoint id="before-menu" /> {items}{' '}
                <ExtensionPoint id="after-menu" />
              </>
            ) : (
              <>
                {urlImgCategory && openOnly !== "vertical" && (
                  <img className={styles.imgCategory} src={urlImgCategory} alt='Imagem Categoria' />
                )}
                {items}
              </>
            )}
          </div>
        </>
      )}
    </>
  )
})

export default injectIntl(Submenu)
