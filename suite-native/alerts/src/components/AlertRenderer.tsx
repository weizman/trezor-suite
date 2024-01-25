import { useAtomValue } from 'jotai';

import { AlertSheet } from './AlertSheet';
import { alertAtom } from '../alertsAtoms';

export const AlertRenderer = () => {
    const alert = useAtomValue(alertAtom);

    return <>{alert && <AlertSheet alert={alert} />}</>;
};
