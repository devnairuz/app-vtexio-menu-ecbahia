import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import type { FC } from 'react'
import { useCssHandles } from 'vtex.css-handles'

import type { IconProps } from '../../shared'

const CSS_HANDLES = [
  'styledLink',
  'styledLinkIcon',
  'styledLinkContainer',
  'styledLinkContent',
  'styledLinkText',
  'accordionIconContainer',
  'accordionIcon',
] as const

const defaultTypography: Record<number, string> = {
  1: 't-body',
  2: 't-body',
  3: 't-body',
}

const Item: FC<ItemProps> = observer((props) => {
  const { handles } = useCssHandles(CSS_HANDLES)
  const {
    to,
    level = 1,
    isTitle,
    disabled,
    iconId,
    iconProps,
    iconPosition,
    typography = defaultTypography[level],
    className,
    onClick,
    children,
    style,
    enableStyle
  } = props

  // Only for level 1
  const hasLink = to && to !== '#'

  // const { rootPath } = useRuntime()

  const linkClassNames = classNames(handles.styledLink, 'no-underline c-on-base w-100 pa0', {
    [typography]: true,
    'fw6 c-on-base': isTitle,
    pointer: !disabled && !isTitle,
  })

  const stylesItem = useMemo(() => {
    if (style) {
      let tempStyle: Record<string, string> = {}

      try {
        tempStyle = JSON.parse(style)
      } catch (e) {
        return {}
      }

      return Object.entries(tempStyle).reduce((obj, [key, value]) => {
        const formatKey = key.replace(/-([a-z])/g, (g) => {
          return g[1].toUpperCase()
        })

        return {
          ...obj,
          [formatKey]: value,
        }
      }, {})
    }

    return {}
  }, [style])

  const iconTestId = `icon-${iconPosition}`

  const iconComponent = iconProps || iconId ? (
    <span
      className={classNames(
        handles.styledLinkIcon,
        'flex items-center'
      )}
      data-testid={iconTestId}
    >
      <img width={20} height={21} src={iconId} alt="icon-menu" />
    </span>
  ) : null

  const content = (
    <div className={classNames(handles.styledLinkContent, 'flex justify-between')}>
      <div className={classNames(handles.styledLinkText, iconComponent && 'nowrap')} {...(enableStyle && { style: stylesItem })}>
        {children} {iconComponent && iconComponent}
      </div>
    </div>
  )

  const generateUrlLink = (origin: string, slug?: string): any => {
    let url = `${origin}/${slug}`;
    const parts = url.split('https://');

    if (parts.length > 0) {
      if (parts[2] !== undefined) {
        url = parts[2].includes("//") ? ('https://' + parts[2].replace("//", "/")) : ('https://' + parts[2]);
      } else {
        if (parts[1] !== undefined) {
          url = parts[1].includes("//") ? ('https://' + parts[1].replace("//", "/")) : ('https://' + parts[1]);
        }
      }
    }
    return url;
  }

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className={classNames(handles.styledLinkContainer, className)}
      onClick={onClick}
    >
      {disabled || !hasLink ? (
        onClick ? (
          <button className={linkClassNames}>{content}</button>
        ) : (
          <span className={linkClassNames}>{content}</span>
        )
      ) : (
        <a className={handles.styledLink} href={generateUrlLink(window.location.origin, to)}>
          {content}
        </a>
      )}
    </div>
  )
})

Item.defaultProps = {
  iconPosition: 'left',
}

export interface ItemProps {
  id?: string
  level?: number
  to?: string
  isTitle?: boolean
  disabled?: boolean
  accordion?: boolean
  typography?: string
  iconId?: string
  iconProps?: IconProps
  iconPosition?: 'left' | 'right'
  tabIndex?: number
  className?: string
  style?: string
  enableStyle?: boolean
  onClick?: () => void
  closeMenu?: (open: boolean) => void
}

export default Item
