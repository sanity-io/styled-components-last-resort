import classnames from 'classnames';
import styles from './view.module.css';

export function View({
  className,
  ...props
}: {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  return <div {...props} className={classnames(styles.initial, className)} />;
}
