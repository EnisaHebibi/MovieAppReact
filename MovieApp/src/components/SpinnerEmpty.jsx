import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";

const SpinnerEmpty = () => {
  return (
    <Empty className="w-full">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="text-white ">
          <Spinner className="size-10" />
        </EmptyMedia>
        <EmptyContent className="text-white">
          Processing your request. Please do not refresh the page!
        </EmptyContent>
      </EmptyHeader>
    </Empty>
  );
};

export default SpinnerEmpty;
