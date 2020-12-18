import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from 'store/actions/globalMarkerActions';

const useGlobalMarker = () => {
  const globalMarker = useSelector((state) => state.globalMarker);

  const dispatch = useDispatch();

  const setColor = useCallback(
    (color) => dispatch(actions.setColor(color)),
    [dispatch],
  );

  const setIsLoading = useCallback(
    (status) => dispatch(actions.setIsLoading(status)),
    [dispatch],
  );

  return [globalMarker, { setColor, setIsLoading }];
};

export default useGlobalMarker;
