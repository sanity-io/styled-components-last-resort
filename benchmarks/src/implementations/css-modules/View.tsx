import { cx } from 'classix';
import styles from './view.module.css';

export function View({
  className,
  style,
  children,
}: {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  return (
    <div className={cx(styles.initial, className)} style={style}>
      {children}
    </div>
  );
}
